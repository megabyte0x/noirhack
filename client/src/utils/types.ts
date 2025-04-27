import type { Hex } from "viem";

export type InputFields = {
    r: bigint;
    s: bigint;
    pubKeyX: bigint;
    pubKeyY: bigint;
    address: Hex;
    nullifier: bigint;
    commitment: bigint;
}

export type MerkleProof = {
    root: bigint;
    pathIndices: number[];
    siblings: bigint[];
    depth: number;
}

export type SignatureData = {
    publicKeyX: Uint8Array;
    publicKeyY: Uint8Array;
    messageHash: Uint8Array;
    signature: Uint8Array;
}