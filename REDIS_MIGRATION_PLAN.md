# Redis Migration & VPS Deployment Plan

This document outlines the steps to migrate the real-time game state from Node.js in-memory (`const games = {}`) to a Dockerized Redis instance. This is required to prevent game data loss during server restarts and to support scaling on a VPS.

## Step 1: Set up Redis via Docker Compose

Create a `docker-compose.yml` file in the root of the project to run Redis alongside your app (and database). This makes deploying to a VPS very easy.

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    container_name: bible_banter_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes # Ensures data persists across container restarts

volumes:
  redis_data:
```

## Step 2: Install Node.js Dependencies

Install the official Redis client for Node.js.

```bash
npm install redis
```

## Step 3: Create the Redis Client (`lib/redis.js`)

Create a centralized Redis connection file that reads the connection URL from environment variables.

```javascript
// lib/redis.js
const { createClient } = require('redis');

// Use REDIS_URL from .env, default to localhost for local development
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect immediately
redisClient.connect().catch(console.error);

module.exports = redisClient;
```

## Step 4: Refactor Socket Handlers (`socket/handlers.js`)

Currently, games are stored in a synchronous tracking object:

```javascript
// Old Way (Synchronous)
const games = {};
games[pin].state = 'active';
```

With Redis, you must rewrite the handler logic to be asynchronous (JSON strings stored in Redis logic):

```javascript
// New Way (Asynchronous)
const redis = require('../lib/redis');

// To GET a game:
const gameData = await redis.get(`game:${pin}`);
if (gameData) {
    let game = JSON.parse(gameData);
    
    // Modify the game state
    game.state = 'active';
    
    // To SAVE the game:
    await redis.set(`game:${pin}`, JSON.stringify(game));
}
```

*Note: Since Redis operations are asynchronous (`async`/`await`), all socket event listeners that interact with the game state must be updated to be `async` functions, and you must add proper error handling (try/catch).*
