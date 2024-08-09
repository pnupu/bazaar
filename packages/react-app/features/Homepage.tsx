// components/BazaarHomepage.tsx

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/Button";
import Image from "next/image";
import { useItems } from "@/utils/api";
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { type Item} from "prisma/prisma-client"
import Link from 'next/link';
import { Tab } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from '@headlessui/react'

type Listing = {
    status: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    title: string;
    price: number;
    imageUrl: string | null;
    sellerId: string;
}

export default function BazaarHomepage() {
  const { data: itemsData, isLoading: itemsLoading } = useItems();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isFocused, setIsFocused] = useState(false);

  const [highlightedItems, setHighlightedItems] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSellClick = () => {
    router.push('/create-item');
  };

  useEffect(() => {
    if (itemsData) {
      setHighlightedItems(itemsData.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString()
      })));
    }
  }, [itemsData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  if (itemsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="w-full mb-4 relative focus:ring-[#f98307] focus:border-[#f98307]">
        <div className="relative focus:ring-[#f98307] focus:border-[#f98307]">
          <Input
            type="text"
            placeholder=" Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border pr-10 pl-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500"
          />
          <button 
            type="submit" 
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-[#f98307]" aria-hidden="true" />
          </button>
        </div>
      </form>
      
      <PrimaryButton
        title="Sell something"
        onClick={handleSellClick}
        widthFull
        className="mb-4 bg-gradient-to-r from-[#fcb603] to-[#f98307] py-3 rounded-full text-white font-bold"
      />
        
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightedItems.map((item) => (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden">
                    <div className="relative aspect-w-4 aspect-h-3">
                      <img
                        src={item.imageUrl ?? `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(item.title)}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>

                      </div>
                    </div>
                  </div>
                </Link>
        ))}
      </div>
    </div>
  );
}