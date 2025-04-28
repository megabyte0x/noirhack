import type { LeanIMT as LeanIMTType, LeanIMTMerkleProof } from "@zk-kit/lean-imt"
import { LeanIMT } from "@zk-kit/lean-imt"
import { poseidon2 } from "poseidon-lite"
import type { MerkleProof } from "./index"
import { MAX_DEPTH } from "./index"

const hash = (a: bigint | number | string, b: bigint | number | string) => poseidon2([a, b]);

export function generateMerkleRoot(commitment: bigint): MerkleProof {
    let tree: LeanIMTType;
    let proof: LeanIMTMerkleProof;

    let root: bigint = BigInt(0);
    let pathIndices: number[] | null = null;
    let siblings: bigint[] = [];
    let proof_length: number | null = null;

    if (process.env.NEXT_PUBLIC_ENV === "dev") {

        tree = new LeanIMT(hash)
        tree.insert(commitment);
        root = tree.root;

        const index = tree.indexOf(commitment);
        proof = tree.generateProof(index);
        proof_length = proof.siblings.length;


        // The index must be converted to a list of indices, 1 for each tree level.
        // The missing siblings can be set to 0, as they won't be used in the circuit.
        const merkleProofIndices = []
        const merkleProofSiblings = proof.siblings

        for (let i = 0; i < MAX_DEPTH; i += 1) {
            merkleProofIndices.push((proof.index >> i) & 1)

            if (merkleProofSiblings[i] === undefined) {
                merkleProofSiblings[i] = BigInt(0)
            }
        }

        pathIndices = merkleProofIndices
        siblings = merkleProofSiblings
    } else {
        // TODO: get root from contract

    }

    if (root !== BigInt(0) && pathIndices !== null && proof_length !== null) {
        return {
            root: root,
            pathIndices: pathIndices,
            siblings: siblings,
            depth: proof_length
        }
    }

    return {
        root: BigInt(0),
        pathIndices: [],
        siblings: [],
        depth: 0
    }
}