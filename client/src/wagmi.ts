import {
  base,
  baseSepolia,
} from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from 'wagmi';

// Your WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        walletConnectWallet, metaMaskWallet
      ]
    }
  ],
  {
    appName: 'TruScore',
    projectId: projectId,
  })

export const config = createConfig({
  connectors,
  chains: [
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [baseSepolia] : []),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
})