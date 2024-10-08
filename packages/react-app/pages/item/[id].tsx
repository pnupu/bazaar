import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { useItem, useUpdateItem, useUpdateItemStatus } from '@/utils/api';
import PrimaryButton from '@/components/Button';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import { trpc } from '@/utils/trpc';
import { useWeb3 } from "@/contexts/useWeb3";
import { uploadImage } from '@/utils/imageUpload';
import { LatLngExpression } from 'leaflet';
import { useChainId } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import axios from 'axios';
import { ShieldCheckIcon, ExclamationTriangleIcon} from '@heroicons/react/24/outline';
import ItemPrice from '@/components/ItemPrice';
import Spinner from '@/components/Spinner';
import Modal from '@/components/InfoModal';
import { SearchContext } from '@/contexts/SearchContext';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});
interface LocationData {
  city: string;
  country: string;
  position: LatLngExpression;
}

interface TransactionDetails {
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  confirmations: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: item, isLoading, error, refetch } = useItem(id as string);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { address, getUserAddress, sendCUSD, signTransaction, mintMinipayNFT } = useWeb3();
  const chainId = useChainId();

  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const updateItemMutation = useUpdateItem();

  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [isSending, setIsSending] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { setIsSearchVisible } = useContext(SearchContext);
  setIsSearchVisible(true)


  const addFeedbackMutation = trpc.items.addFeedback.useMutation();
  const getFeedbackQuery = trpc.items.getFeedback.useQuery({ itemId: id as string }, {
    enabled: !!id && item?.status === 'SOLD',
  });
  
  const getOrCreateConversation = trpc.chat.getOrCreateConversation.useMutation({});
  const updateItemStatusMutation = useUpdateItemStatus();

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address || '' }, {
    enabled: !!address,
  });
  const getOfferStatus = trpc.chat.getOfferStatus.useQuery({ itemId: id as string }, {
    enabled: !!id,
  });

  const sellerFeedbackQuery = trpc.user.getUserFeedback.useQuery(
    { userId: item?.sellerId || '' },
    { enabled: !!item?.sellerId }
  );

  const fetchTransactionDetails = async (txHash: string) => {
    try {
      const response = await axios.get(`https://explorer.celo.org/alfajores/api`, {
        params: {
          module: 'transaction',
          action: 'gettxinfo',
          txhash: txHash
        }
      });
      if (response.data.status === '1' && response.data.result) {
        setTransactionDetails(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };
  useEffect(() => {
    if (item?.status === 'SOLD' && item.txHash) {
      fetchTransactionDetails(item.txHash);
    }
  }, [item]);

  useEffect(() => {
    getUserAddress()
  }, [])
  useEffect(() => {
    if (item) {
      setEditedItem(item);
      setLocationName(item.placeName || '');
      setCoordinates([item.latitude || 0, item.longitude || 0]);
    }
  }, [item]);

  if (isLoading) return  <Spinner />
  if (error) return <div>Error loading item</div>;
  if (!item) return <div>Item not found</div>;
  
  const isChainMismatch = item.chainId !== chainId;
  const sellerUsername = item.seller.username || item.seller.address;
  const isOwner = address === item.seller.address;
  const isBuyer = getOfferStatus.data?.buyerId === userQuery.data?.id;
  const isOfferAccepted = getOfferStatus.data?.status === 'ACCEPTED';
  const agreedAmount = getOfferStatus.data?.amount;
  const sellerAverageRating = sellerFeedbackQuery.data
  ? sellerFeedbackQuery.data.reduce((sum, feedback) => sum + feedback.rating, 0) / sellerFeedbackQuery.data.length
  : 0;



  const handleSubmitFeedback = async () => {
    if (!item || !address || !item.txHash) return;

    try {
      // Prepare feedback data
      const feedbackData = {
        itemId: item.id,
        rating: Number(rating),
        comment,
        sellerId: item.seller.id,
        timestamp: new Date().toISOString(),
      };

      await fetchTransactionDetails(item.txHash)

      // Sign the feedback data
      const messageToSign = JSON.stringify(feedbackData);
      const signature = await signTransaction(messageToSign);

      if (!signature) {
        throw new Error('Failed to sign the message');
      }

      let nftTokenId = null;
      let nftTransactionHash = null;
      



      // Only mint NFT if not on Base Sepolia
      if (chainId !== baseSepolia.id) {
        // Prepare NFT metadata including the signature and transaction details
        const nftMetadata = {
          ...feedbackData,
          signature,
          transactionDetails: {
            chainId: chainId,
            blockNumber: item.txHash ? transactionDetails?.blockNumber : null,
            transactionHash: item.txHash || null,
          },
        };

        // Mint NFT with signed feedback data
        const nftMessage = JSON.stringify(nftMetadata);
        const nftReceipt = await mintMinipayNFT(nftMessage);

        if (!nftReceipt) {
          throw new Error('Failed to mint NFT');
        }

        nftTokenId = nftReceipt.logs[0]?.topics[3];
        nftTransactionHash = nftReceipt.transactionHash;

        if (!nftTokenId) {
          throw new Error('Failed to extract token ID from NFT receipt');
        }
      }

      // Submit feedback with NFT information (if available)
      await addFeedbackMutation.mutateAsync({
        ...feedbackData,
        signature,
        nftTokenId,
        nftTransactionHash,
        transactionDetails: {
          chainId: chainId,
          blockNumber: transactionDetails?.blockNumber ?? null,
          transactionHash: item.txHash || null,
        },
      });
      setModalTitle('Success');
      setModalMessage('Feedback submitted successfully!');
      setModalOpen(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setModalTitle('Error');
      setModalMessage('Failed to submit feedback. Please try again.');
      setModalOpen(true);
    }
  };

  const startChat = async () => {
    const conversation = await getOrCreateConversation.mutateAsync({ itemId: item.id });
    router.push(`/chats/${conversation.id}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedItem(item);
    setLocation('');
    setLocationError(null);
  };

  const fetchLocationData = async (locationInput: string): Promise<LocationData> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Location not found. Please check your input and try again.');
    }

    const { lat, lon, display_name } = data[0];
    const components = display_name.split(', ').reverse();
 
    const firstComponent = components[0];
    const ninthOrLastComponent = components[8] || components[components.length - 1];
  
    const country = firstComponent;
    const city = ninthOrLastComponent;
    const position: [number, number] = [parseFloat(lat), parseFloat(lon)];

    setCoordinates(position);
    setLocationName(city + ", " + country);
    return { city, country, position };
  };

  const handleBuyNow = async () => {
    if (!agreedAmount || !item.seller.address || !item.id) return;

    setIsSending(true);
    try {
      const tx = await sendCUSD(item.seller.address, agreedAmount.toString());
      console.log('Transaction successful:', tx);

      // Update item status to SOLD
      await updateItemStatusMutation.mutateAsync({
        id: item.id,
        status: 'SOLD',
        txHash: tx.transactionHash,
      });

      // Refetch the item to get the updated status
      await refetch();

      // Show a success message
      setModalTitle('Success');
      setModalMessage('Purchase successful! The item is now marked as sold.');
      setModalOpen(true);
    } catch (error) {
      console.error('Error during purchase:', error);
      setModalTitle('Error');
      setModalMessage('There was an error during the purchase. Please try again.');
      setModalOpen(true);
    } finally {
      setIsSending(false);
    }
  };


  const handleSave = async () => {
    if (!editedItem) return;

    let imageUrl = editedItem.imageUrl;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    try {
      if (location) {
        await fetchLocationData(location);
      }

      await updateItemMutation.mutateAsync({
        id: editedItem.id,
        title: editedItem.title,
        description: editedItem.description,
        price: editedItem.price,
        imageUrl: imageUrl ?? undefined,
        latitude: coordinates[0],
        longitude: coordinates[1],
        placeName: locationName,
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleShowMap = async () => {
    if (location) {
      try {
        await fetchLocationData(location);
        setIsOpen(true);
      } catch (error) {
        setLocationError('Failed to load location data. Please try again.');
      }
    } else {
      setLocationError('Please enter a location first.');
    }
  };
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
      {isChainMismatch && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <p>
                This item is on a different network. Please switch to the correct network to interact with this item.
              </p>
            </div>
          </div>
        )}
      <div className="mb-4 p-4 bg-white rounded-lg">
      <div className="flex items-center mb-2">
            <img
              src={item.seller.avatarUrl || '/default-avatar.png'}
              alt={`${sellerUsername}'s avatar`}
              width={50}
              height={50}
              className="rounded-full mr-3"
            />
            <div>
              <div className="flex items-center">
                <p className="font-semibold">{sellerUsername}</p>
                {item.seller.worldcoinProof && (
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 ml-1" title="Worldcoin Verified" />
                )}
              </div>
              {item.seller.worldcoinProof && (
                <p className="text-sm text-gray-600">Worldcoin Verified ({item.seller.worldcoinProof.verificationLevel})</p>
              )}
            </div>
          </div>
          {sellerFeedbackQuery.data?.length ? (
            <>
              <p>Average Rating: {sellerAverageRating.toFixed(1)} / 5</p>  
              <p>Total Ratings: {sellerFeedbackQuery.data?.length || 0}</p>
            </>
          ) : (
            <p>The seller is new and doesn't have ratings</p>
          )}
        </div>
        {isEditing ? (
          <div>
            <Image
            src={item.imageUrl || `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(item.title)}`}
            alt={item.title}
            width={400}
            height={300}
            className="w-full h-auto rounded-lg shadow-md"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="my-4"
            />
          </div>
        ) : (
          <Image
            src={item.imageUrl || `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(item.title)}`}
            alt={item.title}
            width={400}
            height={300}
            className="w-full h-auto rounded-lg shadow-md"
          />
        )}
        <div className='bg-white p-4 mt-2 rounded-lg shadow-md'>
        {isEditing ? (
          <input
            type="text"
            value={editedItem?.title}
            onChange={(e) => setEditedItem({ ...editedItem!, title: e.target.value })}
            className="text-2xl font-bold mt-4 w-full p-2 border rounded"
          />
        ) : (
          <h1 className="text-2xl font-bold">{item.title}</h1>
        )}
        {isEditing ? (
          <input
            type="number"
            value={editedItem?.price}
            onChange={(e) => setEditedItem({ ...editedItem!, price: parseFloat(e.target.value) })}
            className="text-xl font-semibold mt-2 w-full p-2 border rounded"
          />
        ) : (
          <p className="text-xl font-semibold mt-2">{<ItemPrice priceCUSD={Number(item.price.toFixed(2))} />}</p>
        )}
        {isEditing ? (
          <textarea
            value={editedItem?.description}
            onChange={(e) => setEditedItem({ ...editedItem!, description: e.target.value })}
            className="mt-4 w-full p-2 border rounded"
          />
        ) : (
          <p className="mt-4">{item.description}</p>
        )}
        </div>

        {isEditing && (
          <div className="mb-4 mt-4">
            <label htmlFor="location" className="block mb-2">Location</label>
            <div className="flex">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city and country (e.g., London, UK)"
                className="flex-grow p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleShowMap}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Show Map
              </button>
            </div>
            {locationError && <p className="text-red-500 mt-1">{locationError}</p>}
          </div>
        )}

        {!isEditing && item.placeName && (
          <div className="mt-4">
            <PrimaryButton
              title="View Address"
              onClick={() => setIsOpen(true)}
              widthFull
              className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
            />
          </div>
        )}

        {isOwner && !isEditing && (
          <div className="mt-6">
            <PrimaryButton
              title="Edit Item"
              onClick={handleEdit}
              widthFull
              className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
            />
          </div>
        )}
        {isEditing && (
          <div className="mt-6 flex justify-between">
            <PrimaryButton
              title="Save"
              onClick={handleSave}
              className="w-1/2 mr-2 bg-green-600"
            />
            <PrimaryButton
              title="Cancel"
              onClick={handleCancel}
              className="w-1/2 ml-2 bg-red"
            />
          </div>
        )}
        {!isOwner && !isEditing && (
          <>
            {isBuyer && isOfferAccepted && !item.txHash && (
              <div className="mt-6">
                <PrimaryButton
                  title={isSending ? "Processing..." : "Buy Now"}
                  onClick={handleBuyNow}
                  widthFull
                  disabled={isSending || isChainMismatch}
                  className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
                />
              </div>
            )}
            <div className="mt-4">
              <PrimaryButton
                title="Contact Seller"
                onClick={startChat}
                widthFull
                className='bg-gradient-to-r from-[#fcb603] to-[#f98307]'
                disabled={isChainMismatch}
              />
            </div>
          </>
        )}
      </div>
      {(!!item.latitude && !!item.longitude && locationName) && (
        <Map 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        locationName={locationName} 
        coordinates={coordinates} />
      )}
      {item.status === 'SOLD' && isBuyer && !getFeedbackQuery.data && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Leave Feedback</h2>
          <div className="mb-4">
            <label className="block mb-2">Rating (1-5)</label>
            <input
              type="number"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <PrimaryButton
            title={isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            onClick={handleSubmitFeedback}
            widthFull
            disabled={isSubmittingFeedback || Number(rating) < 0  || Number(rating) > 5 || comment === ''}
          />
        </div>
      )}

      {getFeedbackQuery.data && (
        <div className="mt-6 w-full max-w-md bg-white p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Feedback</h2>
          <p>Rating: {getFeedbackQuery.data.rating}/5</p>
          <p>Comment: {getFeedbackQuery.data.comment}</p>
          <p>By: {getFeedbackQuery.data.buyer.username || getFeedbackQuery.data.buyer.address}</p>
        </div>
      )}
      {item?.status === 'SOLD' && transactionDetails && (
          <div className="mt-8 p-6 bg-white shadow-md rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transaction Details</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
            <span className="font-medium">Block Number:</span>
            <span>{transactionDetails.blockNumber}</span>
            
            <span className="font-medium">Timestamp:</span>
            <span>{new Date(parseInt(transactionDetails.timeStamp) * 1000).toLocaleString()}</span>
            
            <span className="font-medium">From:</span>
            <span className="break-all">{transactionDetails.from}</span>
            
            <span className="font-medium">To:</span>
            <span className="break-all">{transactionDetails.to}</span>
            
            <span className="font-medium">Value:</span>
            <span>{parseFloat(transactionDetails.value) / 1e18} CELO</span>
            
            <span className="font-medium">Gas Used:</span>
            <span>{transactionDetails.gasUsed}</span>
            
            <span className="font-medium">Confirmations:</span>
            <span>{transactionDetails.confirmations}</span>
          </div>
          <a 
            href={`https://explorer.celo.org/alfajores/tx/${item.txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            View on Celo Explorer
          </a>
        </div>
        
        
        
        )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}