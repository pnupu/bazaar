import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import PrimaryButton from "@/components/Button";
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';
import { uploadImage } from '@/utils/imageUpload';

export default function SettingsPage() {
  const router = useRouter();
  const { address, getUserAddress } = useWeb3();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address || '' }, {
    enabled: !!address,
  });

  const updateUserMutation = trpc.user.updateUser.useMutation();

  useEffect(() => {
    getUserAddress();
  }, []);

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
        <PrimaryButton
          title="Update Profile"
          onClick={() => handleSubmit}
          widthFull
          loading={updateUserMutation.isLoading || isUploading}
          disabled={updateUserMutation.isLoading || isUploading}
          className="mt-4 bg-gradient-to-r from-[#fcb603] to-[#f98307]"
        />
      </form>
    </div>
  );
}