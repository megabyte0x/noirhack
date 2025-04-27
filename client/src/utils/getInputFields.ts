import { slice, recoverPublicKey, numberToHex } from "viem";
import type { Hex } from "viem";
import { generateCommitment } from "./generateCommitment";
import { generateNullifier } from "./generateNullifier";
import { generateMerkleRoot } from "./generateMerkleTree";
import { generateProof } from "./generateProof";
import type { ProofData } from "@aztec/bb.js";



export const getInputFields = async (signature: Hex, messageHash: Hex, address: Hex) => {
    const signatureWithoutPrefix = slice(signature, 1)
    const r = slice(signatureWithoutPrefix, 0, 32)
    const s = slice(signatureWithoutPrefix, 32, 64)

    let pubKeyHex: Hex = "0x";

    try {
        pubKeyHex = await recoverPublicKey({
            hash: messageHash,
            signature: signature
        })
    } catch (error) {
        console.error('Error recovering public key:', error);
    }

    const pubKeyWithoutPrefix = slice(pubKeyHex, 1)
    const pubKeyX = slice(pubKeyWithoutPrefix, 0, 32)
    const pubKeyY = slice(pubKeyWithoutPrefix, 32, 64)

    const nullifier = numberToHex(generateNullifier())
    // const nullifier = "0xfd1f1cf6"
    const commitment = generateCommitment(nullifier, address)
    const commitmentHex = commitment.toString() as `0x${string}`

    const data = generateMerkleRoot(commitment);


    const root = data.root.toString() as `0x${string}`
    const pathIndices = data.pathIndices
    const siblings = data.siblings.map((s) => s.toString() as `0x${string}`)
    const depth = data.depth

    let proofData: ProofData | null = null;

    try {
        proofData = await generateProof(root, commitmentHex, pathIndices, siblings, depth)

    } catch (error) {
        console.error('Error generating proof:', error);
    }

    return proofData
}