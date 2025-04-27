import { poseidon2 } from "poseidon-lite";
import { numberToHex, type Hex } from "viem";

export function generateCommitment(nullifier: Hex, address: Hex): bigint {
    console.log("nullifier in hex", nullifier)
    console.log("address in hex", address)
    const commitment = poseidon2([address, nullifier]);
    console.log("commitment in bigint", commitment)
    console.log("commitment in hex", numberToHex(commitment))
    return commitment;
}   