const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

const repoRoot = path.resolve(__dirname, '..');
const prismaSchema = path.join(repoRoot, 'prisma', 'schema.prisma');
const schemaAtRoot = path.join(repoRoot, 'schema.prisma');

const schemaPath = exists(prismaSchema) ? prismaSchema : exists(schemaAtRoot) ? schemaAtRoot : null;

if (!schemaPath) {
  console.log('[postinstall] Prisma schema not found; skipping `prisma generate`.');
  console.log('[postinstall] Expected at `prisma/schema.prisma` (or `schema.prisma` at repo root).');
  process.exit(0);
}

console.log(`[postinstall] Found Prisma schema at ${path.relative(repoRoot, schemaPath)}. Running \`prisma generate\`...`);
const res = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'generate', '--schema', schemaPath],
  { stdio: 'inherit' }
);

process.exit(res.status ?? 1);

