import { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { socket_id, channel_name, username } = req.body;

  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: username,
    user_info: {
      name: username
    }
  });

  res.send(authResponse);
}
