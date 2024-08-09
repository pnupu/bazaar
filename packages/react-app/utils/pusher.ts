import Pusher from 'pusher-js';

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {
      'x-user-address': localStorage.getItem('userAddress') || '',
    },
  },
});

export default pusherClient;