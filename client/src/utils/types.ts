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