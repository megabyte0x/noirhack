import type { Hex } from "viem";

export interface AddressInputProps {
    onSubmit: (address: Hex, signature?: Hex, messageHash?: Hex) => void;
    buttonText?: string;
    placeholder?: string;
    isLoading?: boolean;
}

export type LinkWalletMessage = {
    wallet: Hex;
    timestamp: bigint;
    contents: string;
}

