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