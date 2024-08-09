import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { useWeb3 } from "@/contexts/useWeb3";
import PrimaryButton from '@/components/Button';
import pusherClient from '../../utils/pusher';
import Link from 'next/link';
import ChatHeader from '@/components/ChatHeader';


interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  currentPrice: number;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onSubmit, currentPrice }) => {
  const [amount, setAmount] = useState(currentPrice);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Make an Offer</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-end">
          <PrimaryButton title='Cancel' onClick={onClose} className="mr-6 bg-red-700" />
          <PrimaryButton title="Submit Offer" onClick={() => onSubmit(amount)} className='bg-green-700' />
        </div>
      </div>
    </div>
  );
};


const ChatPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { address, getUserAddress } = useWeb3();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { mutate: makeOffer } = trpc.chat.makeOffer.useMutation({
    onSuccess: () => refetch()
  });
  const { mutate: acceptOffer } = trpc.chat.acceptOffer.useMutation({
    onSuccess: () => refetch()
  });

  const { data: conversation, isLoading, refetch } = trpc.chat.getConversation.useQuery(
    { conversationId: id as string },
    { enabled: !!id }
  );

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address ?? "" }, {
    enabled: !!address,
  });

  const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation({
    onSuccess: () => refetch()
  });

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    if (conversation) {
      const channel = pusherClient.subscribe(`private-conversation-${conversation.id}`);
      channel.bind('new-message', () => {
        refetch();
      });

      return () => {
        pusherClient.unsubscribe(`private-conversation-${conversation.id}`);
      };
    }
  }, [conversation, refetch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = () => {
    if (message.trim() && id) {
      sendMessage({ conversationId: id as string, content: message });
      setMessage('');
    }
  };

  const handleMakeOffer = (amount: number) => {
    if (id) {
      makeOffer({ conversationId: id as string, amount });
      setIsOfferModalOpen(false);
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    acceptOffer({ offerId });
  };

  if (isLoading || userQuery.isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading conversation...</div>;
  }

  if (!conversation || !userQuery.data) {
    return <div className="p-4">Conversation not found</div>;
  }

  const isUserSeller = conversation.seller.address === address;
  const otherUser = isUserSeller ? conversation.buyer : conversation.seller;

  return (
    <div className="flex flex-col h-screen bg-white pb-16">

      <ChatHeader 
        otherUser={otherUser}
        item={conversation.item}
        isBuying={!isUserSeller}
      />

      {/* Chat area - scrollable */}
      <div className="flex-1 overflow-y-auto pb-40 pt-4" ref={messagesEndRef}>
        {conversation.offers.map(offer => (
          <div key={offer.id} className="mb-4 p-3 bg-amber-300 rounded shadow w-[70%] rounded-2xl text-center mx-auto">
            <p className="font-semibold">You made an offer: ${offer.amount}</p>
            {offer.status === 'PENDING' && offer.sellerId === userQuery.data?.id && (
              <button className="mt-2 text-blue-500 underline">Accept Offer</button>
            )}
            {offer.status === 'ACCEPTED' && <p className="text-green-600 mt-1">Offer accepted!</p>}
          </div>
        ))}
        {conversation.messages.map(msg => (
          <div key={msg.id} className={`mb-4 ${msg.senderId === userQuery.data?.id ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="flex flex-col items-end max-w-[70%] pr-2">
              <div className={`px-3 py-2 rounded-2xl ${
                msg.senderId === userQuery.data?.id 
                  ? 'bg-[#fcb603] text-white rounded-br-md' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-md'
              }`}>
                <p>{msg.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 mr-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#fcb603] bg-gray-200 p-4">
        <div className="flex mb-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-l-lg p-2 bg-white"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-[#fcb603] to-[#f98307] text-white px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsOfferModalOpen(true)}
            disabled={isUserSeller || conversation.item.status === 'SOLD'}
            className="bg-gradient-to-r from-[#fcb603] to-[#f98307] text-white px-4 py-2 rounded-lg"
          >
            Make Offer
          </button>
          <span>Current Price: ${conversation.item.price}</span>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleMakeOffer}
        currentPrice={conversation.item.price}
      />
    </div>
  );
};

export default ChatPage;