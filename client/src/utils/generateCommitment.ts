import { poseidon2 } from "poseidon-lite";
import type { Hex } from "viem";

export function generateCommitment(nullifier: bigint, address: Hex): bigint {
    const commitment = poseidon2([nullifier, address]);
    return commitment;
}