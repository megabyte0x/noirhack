// Generate a random nullifier

import { generateSiweNonce } from "viem/siwe"

export function generateNullifier(): bigint {
    const randomString = generateSiweNonce()

    const nullifier = BigInt(`0x${randomString}`);
    return nullifier;
}