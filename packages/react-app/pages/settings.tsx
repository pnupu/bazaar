import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import PrimaryButton from "@/components/Button";
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';
import { uploadImage } from '@/utils/imageUpload';
import { useCurrency } from '@/contexts/CurrencyContext';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

export default function SettingsPage() {
  const router = useRouter();
  const { address, getUserAddress } = useWeb3();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currency, toggleCurrency } = useCurrency();

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address || '' }, {
    enabled: !!address,
  });

  const updateUserMutation = trpc.user.updateUser.useMutation();
  const verifyWorldcoinMutation = trpc.user.verifyWorldcoin.useMutation();

  useEffect(() => {
    getUserAddress();
  }, []);

  function formatAppId(appId: string): `app_${string}` {
    return appId.startsWith('app_') ? (appId as `app_${string}`) : `app_${appId}`;
  }
  const { data: worldcoinProof, refetch: refetchWorldcoinProof } = trpc.user.getWorldcoinProof.useQuery(
    { address: address || '' },
    { enabled: !!address }
  );
  
  const handleVerify = async (proof: any) => {
    try {
      await verifyWorldcoinMutation.mutateAsync({
        proof,
        address: address || '',
      });
      alert('Worldcoin verification successful!');
    } catch (error) {
      console.error('Error verifying with Worldcoin:', error);
      alert('Failed to verify with Worldcoin. Please try again.');
    }
  };

  const onSuccess = () => {
    // You can add any additional actions here after successful verification
    console.log('Worldcoin verification completed');
  };

  useEffect(() => {
    if (userQuery.data) {
      setUsername(userQuery.data.username || '');
      setBio(userQuery.data.bio || '');
      setAvatarUrl(userQuery.data.avatarUrl || '');
      
    }
  }, [userQuery.data]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      console.log("No address");
      return;
    }
    setIsUploading(true);
    try {
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadImage(avatarFile);
      }
      await updateUserMutation.mutateAsync({
        address,
        username,
        bio,
        avatarUrl: newAvatarUrl,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (userQuery.isLoading) return <div>Loading user data...</div>;
  if (userQuery.isError) return <div>Error loading user data</div>;

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-md">
      <BackButton />
        <div className="flex items-center justify-between mb-4 pt-2 gap-4">
          <h1 className="text-2xl font-bold flex text-center">User Settings</h1>
          <div className="w-8"></div> 
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4 flex flex-col items-center">
          <img 
            src={avatarUrl || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-32 h-32 rounded-full object-cover mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-blue-500 hover:text-blue-700"
          >
            Change Avatar
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bio" className="block mb-2">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Currency Preference</label>
          <div className="flex items-center">
            <span className={`mr-2 ${currency === 'USD' ? 'font-bold' : ''}`}>USD</span>
            <div 
              className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
                currency === 'EUR' ? 'bg-green-400' : ''
              }`}
              onClick={toggleCurrency}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  currency === 'EUR' ? 'translate-x-6' : ''
                }`}
              ></div>
            </div>
            <span className={`ml-2 ${currency === 'EUR' ? 'font-bold' : ''}`}>EUR</span>
          </div>
        </div>
        <PrimaryButton
          title="Update Profile"
          onClick={() => handleSubmit}
          widthFull
          loading={updateUserMutation.isLoading || isUploading}
          disabled={updateUserMutation.isLoading || isUploading}
          className="mt-4 bg-gradient-to-r from-[#fcb603] to-[#f98307]"
        />
      </form>
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Worldcoin Verification</h2>
        {worldcoinProof ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Verified!</strong>
            <p className="text-sm">
              Verification Level: {worldcoinProof.verificationLevel}
              <br />
              Verified on: {new Date(worldcoinProof.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Not Verified</strong>
            <p className="text-sm">
              Verify your humanhood with Worldcoin to enhance your account security.
            </p>
          </div>
        )}
        <IDKitWidget
          app_id={formatAppId(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || '')}
          action="identity-verificatoin"
          onSuccess={onSuccess}
          handleVerify={handleVerify}
          verification_level={VerificationLevel.Device}
        >
          {({ open }) => (
            <PrimaryButton
              title={worldcoinProof ? "Re-verify with Worldcoin" : "Verify with Worldcoin"}
              onClick={open}
              widthFull
              className="bg-gradient-to-r from-[#fcb603] to-[#f98307]"
            />
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}