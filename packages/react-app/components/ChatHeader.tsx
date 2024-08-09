import React from 'react';
import { ChevronLeftIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface User {
  id: string;
  address: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Item {
  id: string;
  title: string;
}

interface ChatHeaderProps {
  otherUser: User;
  item: Item;
  isBuying: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ otherUser, item, isBuying }) => {
  return (
    <header className="bg-white shadow-sm border-b border-[#fcb603] ">
      <div className='flex items-center justify-between p-4 bg-gray-200'>
        <div className="flex items-center flex-between space-x-3">
            <Link href="/chats" className="text-gray-600 hover:text-gray-800 transition-colors">
                <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            {otherUser.avatarUrl ? (
                
            <img src={otherUser.avatarUrl} alt={otherUser.username || 'User'} className="h-10 w-10 rounded-full" />
            ) : (
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
            )}
            <div>
            <h2 className="text-xl font-semibold">{otherUser.username || 'Unknown User'}</h2>
            <Link href={`/item/${item.id}`} className="text-sm text-gray-500 hover:underline">
                {item.title}
            </Link>
            </div>
        </div>
        
        <div className="bg-gray-100 rounded-full px-3 py-1 inline-block">
            <span className="text-sm font-medium text-gray-700">
            {isBuying ? 'Buying' : 'Selling'}
            </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;