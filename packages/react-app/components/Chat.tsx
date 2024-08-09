import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import pusherClient from '../utils/pusher';
import PrimaryButton from './Button';

interface Participant {
  id: string;
  address: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  conversationId: string;
}

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
}

const Chat: React.FC<{ itemId: string; sellerId: string }> = ({ itemId, sellerId }) => {
  const { address } = useWeb3();
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData } = trpc.chat.getConversations.useQuery();
  const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation();

  const { mutate: getOrCreateConversation } = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConversation(data);
      setConversations(prev => [data, ...prev.filter(c => c.id !== data.id)]);
    },
  });

  useEffect(() => {
  if (itemId && sellerId) {
    getOrCreateConversation({ sellerId });
  }
}, [itemId, sellerId]);

  useEffect(() => {
    if (selectedConversation) {
      const channel = pusherClient.subscribe(`private-conversation-${selectedConversation.id}`);
      channel.bind('new-message', (data: Message) => {
        setSelectedConversation(prev => 
          prev ? { ...prev, messages: [...prev.messages, data] } : null
        );
      });

      return () => {
        pusherClient.unsubscribe(`private-conversation-${selectedConversation.id}`);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (message.trim() && selectedConversation) {
      sendMessage({ conversationId: selectedConversation.id, content: message });
      setMessage('');
    }
  };


  return (
    <div className="flex flex-col h-full">
      {!selectedConversation ? (
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Your Conversations</h2>
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className="p-4 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedConversation(conv)}
            >
              <p className="font-semibold">
                {conv.participants.find(p => p.id !== address)?.username || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {conv.messages[0]?.content || 'No messages yet'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-gray-200 p-4">
            <button onClick={() => setSelectedConversation(null)} className="text-blue-500">
              &lt; Back
            </button>
            <h2 className="text-xl font-bold">
              {selectedConversation.participants.find(p => p.id !== address)?.username || 'Unknown User'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedConversation.messages.map(msg => (
              <div 
                key={msg.id} 
                className={`mb-2 ${msg.senderId === address ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-2 rounded-lg ${
                    msg.senderId === address ? 'bg-blue-500 text-white' : 'bg-gray-200'
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
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;