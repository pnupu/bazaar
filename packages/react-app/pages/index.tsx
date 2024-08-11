import PrimaryButton from "@/components/Button";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";
import BazaarHomepage from "@/features/Homepage";
import { useAccount } from "wagmi";
import Spinner from "@/components/Spinner";

export default function Home() {
  const {
    address,
    getUserAddress,
  } = useWeb3();

  const { isConnected, isConnecting } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWallet = async () => {
      await getUserAddress();
      setIsLoading(false);
    };

    initializeWallet();
  }, [getUserAddress]);

  useEffect(() => {
    if (address) {
      localStorage.setItem('userAddress', address);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnecting) {
      setIsLoading(false);
    }
  }, [isConnecting]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <Spinner />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Please install Metamask and connect.</div>
      </div>
    );
  }

  return <BazaarHomepage />;
}