// pages/chats/index.tsx

import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { trpc } from '../../utils/trpc';
import { useWeb3 } from "@/contexts/useWeb3";

const ChatListPage = () => {
  const router = useRouter();
  const { address } = useWeb3();
  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading chats...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      {conversations && conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map((conv) => {
            const isUserSeller = conv.seller.address === address;
            const otherUser = isUserSeller ? conv.buyer : conv.seller;
            return (
              <Link href={`/chats/${conv.id}`} className="block">
                <div className="border bg-white p-4 mb-2 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="font-semibold">User:</div>
                    <div>{otherUser.username || 'Unknown User'}</div>

                    <div className="font-semibold">Item:</div>
                    <div>{conv.item.title}</div>

                    <div className="font-semibold">
                      {isUserSeller ? 'Seller:' : 'Buyer:'}
                    </div>
                    <div>{isUserSeller ? 'You are selling' : 'You are buying'}</div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="font-semibold text-gray-600">Recent Message:</div>
                    <div className="text-sm text-gray-500 italic truncate">
                      {conv.messages[0]?.content || 'No messages yet'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p>You don't have any conversations yet.</p>
      )}
    </div>
  );
};

export default ChatListPage;