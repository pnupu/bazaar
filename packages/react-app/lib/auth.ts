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
    const defaultUsername = `User_${address.slice(0, 6)}`;
    const avatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${address}`;

    return await prisma.user.create({
      data: {
        address,
        username: defaultUsername,
        avatarUrl: avatarUrl,
      },
    });
  }

  return user;
}