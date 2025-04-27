import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import circuit from "../../../circuit/target/circuit.json";
import type { Hex } from 'viem';

export async function generateProof(
    root: string,
    address: Hex,
    nullifier: Hex,
    pathIndices: Hex,
    siblings: Hex[]

) {
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


    let witness: any;
    try {
        const data = await noir.execute({
            merkle_root: root,
            address: address,
            nullifier: nullifier,
            path_indices: pathIndices,
            sibling_path: siblings
        });
        witness = data.witness;
        console.log("witness", witness);
    } catch (error) {
        console.error('Error executing Noir circuit:', error);
        console.log('Input values:', {
            merkle_root: root,
            address: address,
            nullifier: nullifier,
            path_indices: pathIndices,
            sibling_path: siblings
        });
        throw error;
    }
}

/**
 * Converts an array of path indices to a single Field value
 * This converts the array of 0s and 1s into a single binary number
 */
