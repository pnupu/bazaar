import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { useWeb3 } from "@/contexts/useWeb3";
import PrimaryButton from '@/components/Button';
import pusherClient from '../../utils/pusher';


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
          <button onClick={onClose} className="mr-2">Cancel</button>
          <PrimaryButton title="Submit Offer" onClick={() => onSubmit(amount)} />
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
    <div className="flex flex-col h-screen">
      <div className="bg-gray-200 p-4">
        <button onClick={() => router.push('/chats')} className="text-blue-500">
          &lt; Back to Chats
        </button>
        <h2 className="text-xl font-bold">
          Chat with {otherUser.username || 'Unknown User'}
        </h2>
        <p className="text-sm text-gray-500">Item: {conversation.item.title}</p>
        <p className="text-sm text-gray-500">
          {isUserSeller ? 'You are selling' : 'You are buying'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {conversation.offers.map(offer => (
            <div key={offer.id} className="mb-4 p-2 bg-yellow-100 rounded">
              <p>{offer.buyerId === userQuery.data?.id ? 'You' : 'Buyer'} made an offer: ${offer.amount}</p>
              {offer.status === 'PENDING' && offer.sellerId === userQuery.data?.id && (
                <PrimaryButton title="Accept Offer" onClick={() => handleAcceptOffer(offer.id)} />
              )}
              {offer.status === 'ACCEPTED' && <p className="text-green-600">Offer accepted!</p>}
            </div>
          ))}
        {conversation.messages.map(msg => (
          <div 
            key={msg.id} 
            className={`mb-2 ${msg.senderId === userQuery.data?.id ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block p-2 rounded-lg ${
                msg.senderId === userQuery.data?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
      <div className="flex justify-between mb-2">
          <PrimaryButton
            title="Make Offer"
            onClick={() => setIsOfferModalOpen(true)}
            disabled={isUserSeller || conversation.item.status === 'SOLD'}
          />
          <span>Current Price: ${conversation.item.price}</span>
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Type a message..."
          />
          <PrimaryButton
            title="Send"
            onClick={handleSendMessage}
            className="rounded-l-none"
          />
        </div>
        <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleMakeOffer}
        currentPrice={conversation.item.price}
      />
      </div>
    </div>
  );
};

export default ChatPage;