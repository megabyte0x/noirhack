import { slice, recoverPublicKey, numberToHex } from "viem";
import type { Hex } from "viem";
import { generateCommitment } from "./generateCommitment";
import { generateNullifier } from "./generateNullifier";
import { generateMerkleRoot } from "./generateMerkleTree";
import { generateProof } from "./generateProof";




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

    // const nullifier = numberToHex(generateNullifier())
    const nullifier = "0xfd1f1cf6"
    const commitment = generateCommitment(nullifier, address)

    const data = generateMerkleRoot(commitment);
    const root = data.root
    const pathIndices = calculatePathIndices(data.pathIndices)
    const siblings = data.siblings.map(sibling => numberToHex(sibling))

    let proof: any;

    try {
        proof = await generateProof(root, address, nullifier, pathIndices, siblings)

    } catch (error) {
        console.error('Error generating proof:', error);
    }

    console.log("proof", proof)
    return proof
}

function calculatePathIndices(indices: number[]): Hex {
    // Convert the array of indices to a binary number
    // For example [0, 1, 0, 1] becomes 0101 binary or "5" decimal
    let result = BigInt(0);
    for (let i = 0; i < indices.length; i++) {
        result = (result << BigInt(1)) | BigInt(indices[i]);
    }
    return numberToHex(result)
}