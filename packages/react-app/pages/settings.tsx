// pages/settings.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PrimaryButton from "@/components/Button";
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import BackButton from '@/components/BackButton';

export default function SettingsPage() {
  const router = useRouter();
  const { address, getUserAddress } = useWeb3();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      console.log("No address");
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        address,
        username,
        bio,
        avatarUrl,
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (userQuery.isLoading) return <div>Loading user data...</div>;
  if (userQuery.isError) return <div>Error loading user data</div>;

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4 gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">User Settings</h1>
          <div className="w-8"></div> 
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
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
          <label htmlFor="avatarUrl" className="block mb-2">Avatar URL</label>
          <input
            type="url"
            id="avatarUrl"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <PrimaryButton
          title="Update Profile"
          onClick={() => handleSubmit}
          widthFull
          loading={updateUserMutation.isLoading}
          disabled={updateUserMutation.isLoading}
          className="mt-4"
        />
      </form>
    </div>
  );
}