import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import ItemPrice from '@/components/ItemPrice';

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

  if (userListingsQuery.isLoading || userBoughtItemsQuery.isLoading) return <div>Loading...</div>;
  if (userListingsQuery.isError || userBoughtItemsQuery.isError) return <div>Error loading data</div>;

  const renderItemList = (items: Item[], title: string) => (
    <div className="w-full max-w-md mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p>No items to display.</p>
      ) : (
        items.map((item) => (
          <Link href={`/item/${item.id}`} key={item.id}>
            <div className="mb-4 p-4 border rounded-lg shadow-sm">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-md mb-2" />
              )}
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-gray-800 mt-2">Price: ${<ItemPrice priceCUSD={Number(item.price.toFixed(2))} />}</p>
              <p className="text-gray-600 mt-1">Status: {item.status}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
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