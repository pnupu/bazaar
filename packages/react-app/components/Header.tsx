import { Dialog, Disclosure, Popover, PopoverButton, PopoverPanel, Transition, TransitionChild } from "@headlessui/react";
import { Bars3Icon, MagnifyingGlassIcon, WalletIcon, XMarkIcon, ChatBubbleOvalLeftEllipsisIcon, Bars4Icon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Fragment, useContext, useEffect, useState } from "react";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from 'next/link';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(true);
  const { connect } = useConnect();
  const { address, getUserAddress } = useWeb3();
  const { isConnected } = useAccount();
  const [avatarUrl, setAvatarUrl] = useState('/user-icon.png');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(!isModalOpen);
  const { isAuthenticated } = useAuth();
  const { isSearchElementPresent } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address || '' }, {
    enabled: !!address,
  });

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (window.ethereum?.isMiniPay) {
          await connect({ connector: injected({ target: "metaMask" }) });
        }
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    };
    connectWallet();
  }, [connect]);

  useEffect(() => {
    getUserAddress();
  }, [getUserAddress]);

  useEffect(() => {
    setHideConnectBtn(!isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (userQuery.data && userQuery.data.avatarUrl) {
      setAvatarUrl(userQuery.data.avatarUrl);
    }
  }, [userQuery.data]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); // Close the search popover
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#fcb603] to-[#f98307] text-gray-800 shadow-md border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#8B4513]">Bazaar</h1>
            </Link>
          </div>
          {hideConnectBtn ? (
            <ConnectButton/>
          ) : (                
            <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
          {!isSearchElementPresent && (
                <Popover className="sm:hidden relative">
                {({ open, close }) => (
                  <>
                    <PopoverButton className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                      <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                    </PopoverButton>
                    <Transition
                      show={open}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <PopoverPanel className="fixed inset-x-0 mt-2 top-16 z-10 px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                          <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                              type="text"
                              placeholder="Search items..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full border-2 border-[#8B4513] pr-10 pl-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:ring-[#f98307] focus:border-[#f98307] focus:outline-none"
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </button>
                          </form>
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
              )}
            <Link href="/my-listings">
              <button className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                <Bars3Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </Link>
            <Link href="/chats">
              <button className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </Link>
            <Link href="/settings">
              <button className="rounded-full bg-[#8B4513] p-1 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                <span className="sr-only">User settings</span>
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={avatarUrl}
                  alt="User"
                  width={32}
                  height={32}
                />
              </button>
            </Link>
            <button onClick={openModal} className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
              <WalletIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={openModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Wallet Options
                  </Dialog.Title>
                  <div className="mt-4">
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        mounted,
                      }) => {
                        const ready = mounted;
                        const connected = ready && account && chain;

                        return (
                          <div
                            {...(!ready && {
                              'aria-hidden': true,
                              'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                          >
                            {connected && (
                              <div className="flex flex-col space-y-2">
                                <button onClick={openAccountModal} className="w-full rounded bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                                  View Account
                                </button>
                                <button onClick={openChainModal} className="w-full rounded bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                                  Switch Chain
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#8B4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#A0522D] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#fcb603]"
                      onClick={openModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
          </div>
          </div>
          )}
        </div>
      </div>
    </header>
  );
}