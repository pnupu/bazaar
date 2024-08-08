import { prisma } from '../server/prisma';

export const authenticateSocket = async (address: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { address } });
    return user;
  } catch (err) {
    console.error('Error authenticating WebSocket connection:', err);
    return null;
  }
};

export const broadcastMessage = (wss: any, message: any) => {
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};