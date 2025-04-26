use std::ecdsa_secp256k1::verify_signature;
use std::hash::poseidon2::Poseidon2::hash;
use trees::merkle::MerkleTree;
use trees::types::{MembershipProver, MT_Creator};

/// N is the depth of the Merkle tree. Keeping it at 10 which provides 2^10 leaves.
global N: u32 = 10;

struct Signature {
    public_key_x: [u8; 32],
    public_key_y: [u8; 32],
    signature: [u8; 64],
    message: [u8; 32],
}

fn hasher(leaves: [Field; 2]) -> Field {
    hash(leaves, 2)
}

fn membership_check(
    merkle_root: Field,
    address: Field,
    nullifier: Field,
    path_indices: Field,
    sibling_path: [Field; N],
) {
    let mt = MerkleTree::default(merkle_root, hasher);

    let commitment = hasher([address, nullifier]);

    mt.membership(commitment, path_indices, sibling_path);
}

fn main(
    merkle_root: pub Field,
    address: Field,
    nullifier: Field,
    path_indices: Field,
    sibling_path: [Field; N],
    signature: Signature,
) {
    let valid_signature = verify_signature(
        signature.public_key_x,
        signature.public_key_y,
        signature.signature,
        signature.message,
    );
    /* Checks if the signature is valid. */
    assert(valid_signature);

    /* Checks if the address is a member of the Merkle tree. */
    membership_check(merkle_root, address, nullifier, path_indices, sibling_path);
}
