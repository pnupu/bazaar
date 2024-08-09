// pages/api/pusher/auth.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import { authenticateUser } from '../../../lib/auth';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await authenticateUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { socket_id, channel_name } = req.body;

  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: user.id,
    user_info: {
      name: user.username
    }
  });

  res.send(authResponse);
}