import { NextApiRequest } from 'next';
import { prisma } from '../server/prisma';

export async function authenticateUser(req: NextApiRequest) {
  // Get the user's address from the request headers or query parameters
  const address = req.headers['x-user-address'] as string || req.query.address as string;

  if (!address) {
    return null;
  }

  // Find the user in the database
  const user = await prisma.user.findUnique({
    where: { address },
  });

  // If the user doesn't exist, create a new one
  if (!user) {
    return await prisma.user.create({
      data: { address },
    });
  }

  return user;
}