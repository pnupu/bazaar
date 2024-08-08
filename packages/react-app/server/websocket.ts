import WebSocket, { Server } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { prisma } from './prisma';
import { User } from '@prisma/client';

const wss = new Server({ noServer: true });

export const websocketServer = (server: any) => {
  server.on('upgrade', async function upgrade(request: IncomingMessage, socket: any, head: Buffer) {
    const { pathname, query } = parse(request.url || '', true);

    if (pathname === '/api/chat') {
      const address = query.address as string;
      try {
        // Verify the user exists in the database
        const user = await prisma.user.findUnique({ where: { address } });
        if (user) {
          wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request, user);
          });
        } else {
          socket.destroy();
        }
      } catch (err) {
        console.error('Error authenticating WebSocket connection:', err);
        socket.destroy();
      }
    } else {
      socket.destroy();
    }
  });
};

wss.on('connection', (ws: WebSocket, request: IncomingMessage, user: User) => {
  console.log(`WebSocket connected for user: ${user.address}`);
  ws.on('message', (message: WebSocket.Data) => {
    // Handle incoming messages
    console.log(`Received message from ${user.address}: ${message}`);
  });
});

export const broadcastMessage = (message: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};