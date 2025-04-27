import type { IMTNode, IMTMerkleProof, IMT as IMTType } from "@zk-kit/imt"
import { IMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import type { MerkleProof } from "./index"
const DEPTH = 10;
const ZERO_VALUE = BigInt(0);
const ARITY = 2;

export function generateMerkleRoot(commitment: bigint): MerkleProof {
    let root: string | null = null;
    let tree: IMTType;
    let index: number;
    let proof: IMTMerkleProof;
    let pathIndices: number[] = [];
    let siblings: bigint[] = [];
    if (process.env.NEXT_PUBLIC_ENV === "dev") {

        tree = new IMT(poseidon2, DEPTH, ZERO_VALUE, ARITY);
        tree.insert(commitment);
        root = String(tree.root.valueOf());
        index = tree.indexOf(commitment);
        proof = tree.createProof(index);

        pathIndices = proof.pathIndices;
        siblings = proof.siblings;
    } else {
        // TODO: get root from contract

    }

    if (root !== null && pathIndices.length > 0 && siblings.length > 0) {
        return {
            root: root,
            pathIndices: pathIndices,
            siblings: siblings
        }
    }

    return {
        root: "",
        pathIndices: [],
        siblings: []
    }
}