// pages/search.tsx

import { useState, useEffect } from "react";
import { useSearchItems } from "@/utils/api";
import Link from 'next/link';
import { useRouter } from 'next/router';
import BackButton from '@/components/BackButton';
import ItemPrice from "@/components/ItemPrice";
import Spinner from "@/components/Spinner";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import HeaderWithBackButton from "@/components/SearchHeaderWithBackButton";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading } = useSearchItems(searchQuery);
  const [displayedItems, setDisplayedItems] = useState<Listing[]>([]);

  useEffect(() => {
    if (router.query.q) {
      setSearchQuery(router.query.q as string);
    }
  }, [router.query]);

  useEffect(() => {
    if (searchResults) {
      setDisplayedItems(searchResults.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString()
      })));
    }
  }, [searchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <HeaderWithBackButton title="Search Items" />
      <form onSubmit={handleSearch} className="relative w-full mb-4 focus:ring-[#f98307] focus:border-[#f98307]">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-2 pr-10 pl-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500"
        />
        <button 
            type="submit" 
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-[#f98307]" aria-hidden="true" />
        </button>
      </form>
      
      {isLoading ? (
         <Spinner />
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((item) => (
            <Link href={`/item/${item.id}`} key={item.id}>
              <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="w-full h-48 relative overflow-hidden">
                  <img
                    src={item.imageUrl ?? `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(item.title)}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-800 mt-2">Price: ${<ItemPrice priceCUSD={Number(item.price.toFixed(2))} />}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {displayedItems.length === 0 && !isLoading && (
        <p>No items found. Try a different search term.</p>
      )}
    </div>
  );
}