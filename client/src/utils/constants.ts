export const MAX_DEPTH = 10;
export const CONTRACT_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_ENV === "dev" ? "0xDAD15B1003f0f39738D57D82029f45603689A6cd" : "0xF3451c19a70852533C3416E76e229E15166d5F33";
export const CONTRACT_MERKLE_STORAGE_ADDRESS = process.env.NEXT_PUBLIC_ENV === "dev" ? "0x1fef112c3284ec7266be40b8b4bf6c177251ecf0" : "0x6C27b8604e7DAe0D7e319a9C45006BAd71EaB7a9";
export const BLOCK_EXPLORER_URL = process.env.NEXT_PUBLIC_ENV === "dev" ? "https://sepolia.basescan.org" : "https://basescan.org";