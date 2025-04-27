// Generate a random nullifier

export function generateNullifier(): bigint {
    // Use browser-compatible crypto API
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);

    // Use a large random number for the nullifier
    return BigInt(array[0]);
}