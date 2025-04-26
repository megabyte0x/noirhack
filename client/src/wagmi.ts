import {
  base,
  baseSepolia,
} from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { http, createConfig } from '@wagmi/core'

export const config = createConfig({
  connectors: [walletConnect({ projectId: 'e3cd993cfa41062f790eedd5875cc489' }), injected()],
  chains: [
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [baseSepolia] : []),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});