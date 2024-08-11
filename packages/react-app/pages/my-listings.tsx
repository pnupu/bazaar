import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import ItemPrice from '@/components/ItemPrice';
import { SearchContext } from '@/contexts/SearchContext';
import Spinner from '@/components/Spinner';

type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  imageUrl: string | null;
};

export default function MyListingsPage() {
  const router = useRouter();
  const { address, getUserAddress } = useWeb3();
  const [listings, setListings] = useState<Item[]>([]);
  const [boughtItems, setBoughtItems] = useState<Item[]>([]);

  const { setIsSearchVisible } = useContext(SearchContext);
  setIsSearchVisible(true)

  const userListingsQuery = trpc.items.getUserItems.useQuery(
    { address: address || '' },
    { enabled: !!address }
  );

  const userBoughtItemsQuery = trpc.items.getUserBoughtItems.useQuery(
    { address: address || '' },
    { enabled: !!address }
  );

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    if (userListingsQuery.data) {
      setListings(userListingsQuery.data);
    }
    if (userBoughtItemsQuery.data) {
      setBoughtItems(userBoughtItemsQuery.data);
    }
  }, [userListingsQuery.data, userBoughtItemsQuery.data]);

  if (userListingsQuery.isLoading || userBoughtItemsQuery.isLoading) return <Spinner />;
  if (userListingsQuery.isError || userBoughtItemsQuery.isError) return <div>Error loading data</div>;

  const renderItemList = (items: Item[], title: string) => (
    <div className="w-full max-w-md mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p>No items to display.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link href={`/item/${item.id}`} key={item.id}>
              <div className="border bg-white p-4 rounded-lg cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-4">
                    <img
                      src={item.imageUrl ?? `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(item.title.charAt(0))}`}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">Price: {<ItemPrice priceCUSD={Number(item.price.toFixed(2))} />}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Status: {item.status}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );


  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md pb-4">
        <div className="flex items-center justify-between mb-4">
          <BackButton />
          <h1 className="text-2xl font-bold">My Items</h1>
          <div className="w-8"></div>
        </div>
      </div>
      {renderItemList(listings, "My Listings")}
      {renderItemList(boughtItems, "Items I've Bought")}
    </div>
  );
}