import { UltraHonkBackend } from '@aztec/bb.js';
import type { ProofData } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import circuit from "../circuit/circuit.json"
import type { SignatureData } from "./types";

export async function generateProof(
    root: `0x${string}`,
    commitment: `0x${string}`,
    pathIndices: number[],
    siblings: `0x${string}`[],
    depth: number,
    signatureData: SignatureData
): Promise<ProofData> {
    let noir: Noir | null = null;
    let backend: UltraHonkBackend | null = null;
    try {
        noir = new Noir(circuit as CompiledCircuit);
        backend = new UltraHonkBackend(circuit.bytecode);
    } catch (error) {
        console.error('Error initializing Noir:', error);
    }

    if (!noir || !backend) {
        throw new Error('Failed to initialize Noir or backend');
    }

    let witness: Uint8Array;
    try {
        const data = await noir.execute({
            commitment: commitment,
            merkle_proof_depth: depth,
            merkle_proof_indices: pathIndices,
            merkle_proof_siblings: siblings,
            expected_merkle_root: root,
            signatureData: {
                public_key_x: Array.from(signatureData.publicKeyX),
                public_key_y: Array.from(signatureData.publicKeyY),
                message_hash: Array.from(signatureData.messageHash),
                signature: Array.from(signatureData.signature)
            }
        });
        witness = data.witness;
    } catch (error) {
        console.error('Error executing Noir circuit:', error);
        console.log('Proof generation failed with Inputs:', {
            commitment: commitment,
            merkle_proof_depth: depth,
            merkle_proof_indices: pathIndices,
            merkle_proof_siblings: siblings,
            expected_merkle_root: root,
            signatureData: {
                public_key_x: Array.from(signatureData.publicKeyX),
                public_key_y: Array.from(signatureData.publicKeyY),
                message_hash: Array.from(signatureData.messageHash),
                signature: Array.from(signatureData.signature)
            }
        });
        throw error;
    }

    const proof = await backend.generateProof(witness, { keccak: true });

    return proof;
}