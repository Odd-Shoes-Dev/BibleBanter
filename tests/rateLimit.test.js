const { createRateLimit } = require('../utils/rateLimit');

// Mock Express req/res/next
function mockReq(ip = '127.0.0.1') {
  return { ip, connection: { remoteAddress: ip } };
}

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
  };
  return res;
}

describe('createRateLimit()', () => {
  test('allows requests under the limit', () => {
    const limiter = createRateLimit({ windowMs: 1000, max: 3 });
    const req = mockReq();
    const res = mockRes();
    let called = 0;
    const next = () => { called++; };

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    expect(called).toBe(3);
    expect(res.statusCode).toBeNull();
  });

  test('blocks requests over the limit', () => {
    const limiter = createRateLimit({ windowMs: 1000, max: 2 });
    const req = mockReq();
    const res = mockRes();
    let called = 0;
    const next = () => { called++; };

    limiter(req, res, next); // 1 — allowed
    limiter(req, res, next); // 2 — allowed
    limiter(req, res, next); // 3 — blocked

    expect(called).toBe(2);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toContain('Too many requests');
  });

  test('tracks IPs separately', () => {
    const limiter = createRateLimit({ windowMs: 1000, max: 1 });
    const req1 = mockReq('1.1.1.1');
    const req2 = mockReq('2.2.2.2');
    const res1 = mockRes();
    const res2 = mockRes();
    let called = 0;
    const next = () => { called++; };

    limiter(req1, res1, next); // IP1 — allowed
    limiter(req2, res2, next); // IP2 — allowed (different IP)

    expect(called).toBe(2);
  });

  test('uses custom error message', () => {
    const limiter = createRateLimit({ windowMs: 1000, max: 1, message: 'Slow down!' });
    const req = mockReq();
    const res = mockRes();

    limiter(req, res, () => {}); // 1st — allowed
    limiter(req, res, () => {}); // 2nd — blocked

    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe('Slow down!');
  });

  test('resets after window expires', async () => {
    const limiter = createRateLimit({ windowMs: 100, max: 1 });
    const req = mockReq();
    let called = 0;
    const next = () => { called++; };

    limiter(req, mockRes(), next); // allowed
    limiter(req, mockRes(), next); // blocked

    expect(called).toBe(1);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    limiter(req, mockRes(), next); // allowed again
    expect(called).toBe(2);
  });
});
