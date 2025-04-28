use binary_merkle_root::binary_merkle_root;
use std::ecdsa_secp256k1::verify_signature;
use std::hash::poseidon::bn254::hash_2 as poseidon2;

/// N is the depth of the Merkle tree. Keeping it at 10 which provides 2^10 leaves.
global MAX_DEPTH: u32 = 10;

struct SignatureData {
    public_key_x: [u8; 32],
    public_key_y: [u8; 32],
    signature: [u8; 64],
    message_hash: [u8; 32],
}

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
    expected_merkle_root: pub Field,
    signatureData: SignatureData,
) {
    let public_key_x = signatureData.public_key_x;
    let public_key_y = signatureData.public_key_y;
    let message_hash = signatureData.message_hash;
    let signature = signatureData.signature;

    println("public_key_x:");
    println(public_key_x);
    println("public_key_y:");
    println(public_key_y);
    println("message_hash:");
    println(message_hash);
    println("signature:");
    println(signature);

    let is_valid_signature = verify_signature(public_key_x, public_key_y, signature, message_hash);

    println("is_valid_signature:");
    println(is_valid_signature);

    assert(is_valid_signature);

    /* Checks if the address is a member of the Merkle tree. */
    let is_member = membership_check(
        commitment,
        merkle_proof_depth,
        merkle_proof_indices,
        merkle_proof_siblings,
        expected_merkle_root,
    );

    assert(is_member);
}
