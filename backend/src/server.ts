import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { disconnectPrisma } from './infrastructure/database/prisma.js';
import { initSocketServer } from './infrastructure/websocket/SocketServer.js';

const app = createApp();
const httpServer = createServer(app);
initSocketServer(httpServer);

const server = httpServer.listen(env.PORT, () => {
  console.log(`🚀 Clinic AI backend listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
