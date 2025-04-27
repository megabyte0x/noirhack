import { poseidon2 } from "poseidon-lite";
import type { Hex } from "viem";

export function generateCommitment(nullifier: Hex, address: Hex): bigint {
    const commitment = poseidon2([address, nullifier]);
    return commitment;
}   