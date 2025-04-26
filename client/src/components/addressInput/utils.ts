import type { TypedData, TypedDataDomain } from 'viem'
import { hashTypedData } from 'viem'
import type { Hex } from 'viem'


export const types = {
    LinkWallet: [
        { name: 'wallet', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'contents', type: 'string' },
    ],
} as const satisfies TypedData;

export const domain = {
    name: 'TruScore',
    version: '1',
    chainId: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? 84532 : 8453, // Ethereum Mainnet
} as const satisfies TypedDataDomain;

export const message = (address: Hex) => ({
    wallet: address,
    timestamp: BigInt(Math.floor(Date.now() / 1000)),
    contents: `Connect my wallet ${address} to my TruScore profile `,
});

// TODO: fix this
// @ts-ignore
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const typedDataHash = (typedData: any) => {
    return hashTypedData(typedData)
}