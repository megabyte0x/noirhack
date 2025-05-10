import type { LeanIMT as LeanIMTType, LeanIMTMerkleProof } from "@zk-kit/lean-imt"
import { LeanIMT } from "@zk-kit/lean-imt"
import { poseidon2 } from "poseidon-lite"
import type { MerkleProof } from "./index"
import { MAX_DEPTH } from "./index"
import type { Hex } from "viem"

const hash = (a: bigint | number | string, b: bigint | number | string) => poseidon2([a, b]);

export async function generateMerkleRoot(commitment: bigint, address: Hex): Promise<MerkleProof> {
    let proof: LeanIMTMerkleProof;

    let root: bigint = BigInt(0);
    let pathIndices: number[] | null = null;
    let siblings: bigint[] = [];
    let proof_length: number | null = null;

    // fetch leaves from local storage
    const leaves = JSON.parse(localStorage.getItem("merkleTreeLeaves") || "[]");
    console.log("leaves", leaves)
    const tree = new LeanIMT(hash, leaves ? leaves.map((leaf: string) => BigInt(leaf)) : [])

    tree.insert(commitment);
    root = tree.root;

    // Save leaves to local storage
    localStorage.setItem("merkleTreeLeaves", JSON.stringify(tree.leaves.map(leaf => leaf.toString())));

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