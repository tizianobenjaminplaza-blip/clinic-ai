import { Server as HttpServer } from 'node:http';
import { Server as SocketIO, type Socket } from 'socket.io';
import { env } from '../../config/env.js';

let io: SocketIO | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIO {
  io = new SocketIO(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
    path: '/socket.io',
  });

  io.on('connection', (socket: Socket) => {
    // Clients join a room by clinicId so broadcasts are scoped.
    socket.on('join:clinic', (clinicId: string) => {
      void socket.join(`clinic:${clinicId}`);
    });
    socket.on('disconnect', () => {/* handled by socket.io */});
  });

  return io;
}

/** Emit a typed event to all sockets in a clinic room. */
export function emitToClinic(
  clinicId: string,
  event: ClinicEvent['type'],
  payload: ClinicEvent['payload'],
): void {
  io?.to(`clinic:${clinicId}`).emit(event, payload);
}

// ── Event catalogue ──────────────────────────────────────
export type ClinicEvent =
  | { type: 'lead:new';     payload: { id: string; phone: string; name: string | null } }
  | { type: 'lead:engaged'; payload: { id: string } }
  | { type: 'message:in';   payload: { leadId: string; text: string } }
  | { type: 'message:out';  payload: { leadId: string; text: string } }
  | { type: 'payment:activated'; payload: { clinicId: string } };
