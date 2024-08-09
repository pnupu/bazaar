import { Dialog, Disclosure, Popover, PopoverButton, PopoverPanel, Transition, TransitionChild } from "@headlessui/react";
import { Bars3Icon, MagnifyingGlassIcon, WalletIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from 'next/link';
import { useWeb3 } from "@/contexts/useWeb3";
import { trpc } from '../utils/trpc';
import { useRouter } from "next/router";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(false);
  const { connect } = useConnect();
  const { address, getUserAddress } = useWeb3();
  const [avatarUrl, setAvatarUrl] = useState('/user-icon.png');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(!isModalOpen);

  const userQuery = trpc.user.getUserWithAddress.useQuery({ address: address || '' }, {
    enabled: !!address,
  });

  useEffect(() => {
    getUserAddress();
    if (window.ethereum?.isMiniPay) {
      setHideConnectBtn(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, []);

  useEffect(() => {
    if (userQuery.data && userQuery.data.avatarUrl) {
      setAvatarUrl(userQuery.data.avatarUrl);
    }
  }, [userQuery.data]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#fcb603] to-[#f98307] text-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#8B4513]">Bazaar</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Popover className="sm:hidden relative">
                {({ open, close }) => (
                  <>
                    <PopoverButton className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                      <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                    </PopoverButton>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <PopoverPanel className="fixed inset-x-0 top-16 z-10 px-4 sm:px-6 lg:px-8 ">
                        <div className="mx-auto max-w-3xl">
                          <form onSubmit={(e) => { handleSearchSubmit(e); close(); }} className="relative">
                            <input
                              type="text"
                              className="w-full border-2 border-[#8B4513] pr-10 rounded-full focus:ring-[#A0522D] focus:border-[#A0522D] bg-white text-gray-900 placeholder-gray-500"
                              placeholder=" Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </button>
                          </form>
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
            
            <Link href="/my-listings">
              <button className="rounded-full bg-[#8B4513] p-2 text-white hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fcb603] transition-colors">
                <span className="sr-only">My Listings</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </Link>
            <Link href="/chats">
              <span className="text-sm font-medium text-gray-700 hover:text-gray-800">
                Chats
              </span>
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
              <WalletIcon className="h-5 w-5" aria-hidden="true" />
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
      </div>
    </header>
  );
}