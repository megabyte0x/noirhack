use binary_merkle_root::binary_merkle_root;
use std::hash::poseidon::bn254::hash_2 as poseidon2;

/// N is the depth of the Merkle tree. Keeping it at 10 which provides 2^10 leaves.
global MAX_DEPTH: u32 = 10;

/*
struct Signature {
    public_key_x: [u8; 32],
    public_key_y: [u8; 32],
    signature: [u8; 64],
    message: [u8; 32],
}
*/

/*
This is with the IMT implementation.
fn membership_check(
    merkle_root: Field,
    address: Field,
    nullifier: Field,
    path_indices: Field,
    sibling_path: [Field; N],
) {
    let mt = MerkleTree::from(merkle_root, hasher);
    let commitment = hasher([address, nullifier]);

    println("merkle_root:");
    println(merkle_root);
    println("address:");
    println(address);
    println("nullifier:");
    println(nullifier);
    println("path_indices:");
    println(path_indices);
    println("sibling_path:");
    println(sibling_path);
    println("commitment:");
    println(commitment);

    mt.membership(commitment, path_indices, sibling_path);
}
*/

/*
This is with the binary merkle root implementation.
*/
fn membership_check(
    commitment: Field,
    merkle_proof_depth: u32,
    merkle_proof_indices: [u1; MAX_DEPTH],
    merkle_proof_siblings: [Field; MAX_DEPTH],
    expected_merkle_root: Field,
) -> bool {
    let merkle_root = binary_merkle_root(
        poseidon2,
        commitment,
        merkle_proof_depth,
        merkle_proof_indices,
        merkle_proof_siblings,
    );

    println("merkle_root:");
    println(merkle_root);

    merkle_root == expected_merkle_root
}

fn main(
    commitment: Field,
    merkle_proof_depth: u32,
    merkle_proof_indices: [u1; MAX_DEPTH],
    merkle_proof_siblings: [Field; MAX_DEPTH],
    expected_merkle_root: Field,
) {
    /* Checks if the address is a member of the Merkle tree. */
    let is_member = membership_check(
        commitment,
        merkle_proof_depth,
        merkle_proof_indices,
        merkle_proof_siblings,
        expected_merkle_root,
    );

    println("is_member:");
    println(is_member);
}
