import React, { useState, useEffect } from 'react';
import pusherClient from '../utils/pusher';

interface Message {
  id: string;
  username: string;
  message: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Prompt for username when component mounts
    const user = prompt('Enter your username:');
    if (user) setUsername(user);

    // Subscribe to the channel
    const channel = pusherClient.subscribe('chat-channel');
    
    channel.bind('message', (data: Message) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      pusherClient.unsubscribe('chat-channel');
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      username,
      message: inputMessage.trim()
    };

    // Send message to your API
    await fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMessage),
    });

    setInputMessage('');
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 h-64 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-bold">{msg.username}: </span>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
