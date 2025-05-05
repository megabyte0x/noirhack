import { slice, recoverPublicKey, numberToHex, parseSignature, hexToBytes } from "viem";
import type { Hex, Signature } from "viem";
import { generateCommitment } from "./generateCommitment";
import { generateNullifier } from "./generateNullifier";
import { generateMerkleRoot } from "./generateMerkleTree";
import { generateProof } from "./generateProof";
import type { ProofData } from "@aztec/bb.js";
import type { SignatureData } from "./types";


export const getInputFields = async (userSignature: Hex, messageHash: Hex, address: Hex): Promise<{ proofData: ProofData, merkleRoot: Hex }> => {
    let signatureData: SignatureData | null = null;

    // Parse the Ethereum signature using Viem's parseSignature utility
    // This will split the signature into r, s, and v (yParity)
    const parsedSignature = parseSignature(userSignature);

    // For Noir's verify_signature, we need to create a 64-byte array from r and s
    const rBytes = hexToBytes(parsedSignature.r, { size: 32 });
    const sBytes = hexToBytes(parsedSignature.s, { size: 32 });

    // Concatenate r and s for Noir's [u8; 64] signature format
    const signatureBytes = new Uint8Array(64);
    signatureBytes.set(rBytes, 0);
    signatureBytes.set(sBytes, 32);

    let pubKeyHex: Hex = "0x";

    try {
        pubKeyHex = await recoverPublicKey({
            hash: messageHash,
            signature: userSignature
        })
    } catch (error) {
        console.error('Error recovering public key:', error);
    }

    const pubKeyWithoutPrefix = slice(pubKeyHex, 1)
    const pubKeyX = slice(pubKeyWithoutPrefix, 0, 32)
    const pubKeyY = slice(pubKeyWithoutPrefix, 32, 64)

    signatureData = {
        publicKeyX: hexToBytes(pubKeyX, { size: 32 }),
        publicKeyY: hexToBytes(pubKeyY, { size: 32 }),
        messageHash: hexToBytes(messageHash, { size: 32 }),
        signature: signatureBytes
    }

    const nullifier = numberToHex(generateNullifier())
    const commitment = generateCommitment(nullifier, address)
    const commitmentHex = commitment.toString() as `0x${string}`

    const data = await generateMerkleRoot(commitment, address);


    const root = data.root.toString() as `0x${string}`
    const pathIndices = data.pathIndices
    const siblings = data.siblings.map((s) => s.toString() as `0x${string}`)
    const depth = data.depth

    let proofData: ProofData | null = null;

    try {
        proofData = await generateProof(root, commitmentHex, pathIndices, siblings, depth, signatureData)
    } catch (error) {
        console.error('Error generating proof:', error);
    }
    if (proofData === null) {
        throw new Error("Proof generation failed");
    }
    return {
        proofData: proofData,
        merkleRoot: root,
    }

}