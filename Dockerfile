FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

RUN npm ci --omit=dev && npx prisma generate

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
