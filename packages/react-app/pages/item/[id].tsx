// pages/item/[id].tsx

import { useRouter } from 'next/router';
import { useState } from 'react';
import { useItem } from '@/utils/api';
import PrimaryButton from '@/components/Button';
import Map from '@/components/Map';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import { trpc } from '@/utils/trpc';

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: item, isLoading, error } = useItem(id as string);
  const [isOpen, setIsOpen] = useState(false);

  const getOrCreateConversation = trpc.chat.getOrCreateConversation.useMutation({});

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading item</div>;
  if (!item) return <div>Item not found</div>;

  const startChat = async () => {
    const conversation = await getOrCreateConversation.mutateAsync({ itemId: item.id });
    router.push(`/chats/${conversation.id}`);
  };
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <Image
          src={item.imageUrl || `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(item.title)}`}
          alt={item.title}
          width={400}
          height={300}
          className="w-full h-auto rounded-lg shadow-md"
        />
        <h1 className="text-2xl font-bold mt-4">{item.title}</h1>
        <p className="text-xl font-semibold mt-2">${item.price.toFixed(2)}</p>
        <p className="mt-4">{item.description}</p>

        {/* Tää ois se address button */}
        <div className="mt-4">
          <PrimaryButton
            title="View Address"
            onClick={() => setIsOpen(true)}
            widthFull
            className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
          />
        </div>

        <div className="mt-6">
          <PrimaryButton
            title="Buy Now"
            onClick={() => console.log('Buy button clicked')}
            widthFull
            className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
          />
        </div>
        <div className="mt-4">
          <PrimaryButton
            title="Contact Seller"
            onClick={startChat}
            widthFull
            className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
          />
        </div>
      </div>
      {(!!item.latitude && !!item.longitude ) && (
        <Map 
        isOpen={isOpen} 
        onClose={() => setIsOpen(!isOpen)} 
        locationName={item.placeName ?? ""} 
        coordinates={[item.latitude, item.longitude]} />
      )}
    </div>
  );
}

