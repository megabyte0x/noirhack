import { UltraHonkBackend } from '@aztec/bb.js';
import type { ProofData } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import circuit from "../../../circuit/target/circuit.json";
import type { Hex } from 'viem';

export async function generateProof(
    root: `0x${string}`,
    commitment: `0x${string}`,
    pathIndices: number[],
    siblings: `0x${string}`[],
    depth: number
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


    let witness: Uint8Array<ArrayBufferLike>;
    try {
        const data = await noir.execute({
            commitment: commitment,
            merkle_proof_depth: depth,
            merkle_proof_indices: pathIndices,
            merkle_proof_siblings: siblings,
            expected_merkle_root: root
        });
        console.log('Input values:', {
            commitment: commitment,
            merkle_proof_depth: depth,
            merkle_proof_indices: pathIndices,
            merkle_proof_siblings: siblings,
            expected_merkle_root: root
        });
        witness = data.witness;
    } catch (error) {
        console.error('Error executing Noir circuit:', error);
        console.log('Input values:', {
            commitment: commitment,
            merkle_proof_depth: depth,
            merkle_proof_indices: pathIndices,
            merkle_proof_siblings: siblings,
            expected_merkle_root: root
        });
        throw error;
    }

    const proof = await backend.generateProof(witness);
    console.log("proof", proof.proof)

    return proof;
}