// pages/search.tsx

import { useState, useEffect } from "react";
import { useSearchItems } from "@/utils/api";
import Link from 'next/link';
import { useRouter } from 'next/router';
import BackButton from '@/components/BackButton';

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: { id: string; name: string };
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
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Search Items</h1>
          <div className="w-8"></div>
        </div>
      </div>
      <form onSubmit={handleSearch} className="w-full mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </form>
      
      {isLoading ? (
        <div>Loading...</div>
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
                  <p className="text-sm text-gray-600 mt-1">
                    {item.category.name}
                  </p>
                  <p className="text-sm text-gray-800 mt-2">Price: ${item.price.toFixed(2)}</p>
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