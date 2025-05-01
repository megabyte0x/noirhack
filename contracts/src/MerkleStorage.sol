// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {HonkVerifier} from "./utils/Verifier.sol";

contract MerkleStorage {
    event MerkleStorage__Update(address indexed user, string merkleRoot);

    address public verifier;
    address public owner;

    mapping(address => string) public merkleRoots;

    constructor(address _verifier) {
        verifier = _verifier;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert("Only the owner can call this function");
        }
        _;
    }

    modifier onlyVerified(bytes calldata _proof, bytes32[] calldata _publicInputs) {
        bool verified = HonkVerifier(verifier).verify(_proof, _publicInputs);
        if (!verified) {
            revert("Proof verification failed");
        }
        _;
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
    }

    function updateMerkleRoot(string memory _merkleRoot, bytes calldata _proof, bytes32[] calldata _publicInputs)
        public
        onlyVerified(_proof, _publicInputs)
    {
        merkleRoots[msg.sender] = _merkleRoot;

        emit MerkleStorage__Update(msg.sender, _merkleRoot);
    }

    function getMerkleRoot(address _address) public view returns (string memory) {
        return merkleRoots[_address];
    }
}
