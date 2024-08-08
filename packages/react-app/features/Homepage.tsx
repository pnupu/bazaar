// components/BazaarHomepage.tsx

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/Button";
import Image from "next/image";
import { useCategories, useItems } from "@/utils/api";
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { type Item, type Category} from "prisma/prisma-client"
import Link from 'next/link';

type Listing = {
    status: string;
    category: { id: string; name: string };
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    title: string;
    price: number;
    imageUrl: string | null;
    sellerId: string;
    categoryId: string;
}

export default function BazaarHomepage() {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: itemsData, isLoading: itemsLoading } = useItems();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [categories, setCategories] = useState<string[]>([]);
  const [highlightedItems, setHighlightedItems] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');


  const handleSellClick = () => {
    router.push('/create-item');
  };

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map((cat: any) => cat.name));
    }
  }, [categoriesData]);

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

  if (categoriesLoading || itemsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <form onSubmit={handleSearch} className="w-full mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </form>
            
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {categories.map((category, index) => (
          <button key={index} className="px-3 py-1 rounded">
            {category}
          </button>
        ))}
      </div>
        
    <PrimaryButton
        title="Sell something"
        onClick={handleSellClick}
        widthFull
        className="mb-4"
    />
        
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightedItems.map((item) => (
                  <Link href={`/item/${item.id}`} key={item.id}>

          <div key={item.id} className="border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm">
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
    </div>
  );
}