// pages/my-listings.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default function MyListingsPage() {
  const router = useRouter();
  const { address, getUserAddress } = useWeb3();
  const [listings, setListings] = useState<any[]>([]);

  const userListingsQuery = trpc.items.getUserItems.useQuery(
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
  }, [userListingsQuery.data]);

  if (userListingsQuery.isLoading) return <div>Loading your listings...</div>;
  if (userListingsQuery.isError) return <div>Error loading your listings</div>;

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <BackButton />
          <h1 className="text-2xl font-bold">My Listings</h1>
          <div className="w-8"></div>
        </div>
      </div>
      <div className="w-full max-w-md">
        {listings.length === 0 ? (
          <p>You haven't listed any items yet.</p>
        ) : (
          listings.map((item) => (
            <Link href={`/item/${item.id}`} key={item.id}>
              <div className="mb-4 p-4 border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 mt-2">Price: ${item.price.toFixed(2)}</p>
                <p className="text-gray-600 mt-1">Status: {item.status}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}