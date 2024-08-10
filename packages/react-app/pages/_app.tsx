import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import type { AppProps } from "next/app";
import { WagmiProvider, createConfig, http } from "wagmi";
import { celo, celoAlfajores, base } from "wagmi/chains";
import Layout from "../components/Layout";
import { trpc } from '../utils/trpc';
import { AuthProvider } from '../contexts/AuthContext';
import "../styles/globals.css";
import { CurrencyProvider } from '../contexts/CurrencyContext';
import dynamic from 'next/dynamic';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "Celo Composer",
    projectId: process.env.WC_PROJECT_ID ?? "044601f65212332475a09bc14ceb3c34",
  }
);

const config = createConfig({
  connectors,
  chains: [celo, celoAlfajores, base],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

const LeafletCSS = dynamic(() => import('../components/LeafletCSS'), { ssr: false });


function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            <CurrencyProvider>
              <Layout>
                <LeafletCSS />
                <Component {...pageProps} />
              </Layout>
            </CurrencyProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default trpc.withTRPC(App);
