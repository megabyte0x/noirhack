import { CONTRACT_MERKLE_STORAGE_ADDRESS } from "../utils/constants";

export const MERKLE_STORAGE_CONTRACT = {
    address: CONTRACT_MERKLE_STORAGE_ADDRESS,
    abi: [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "_verifier",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getMerkleRoot",
            "inputs": [
                {
                    "name": "_address",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "merkleRoots",
            "inputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setVerifier",
            "inputs": [
                {
                    "name": "_verifier",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "updateMerkleRoot",
            "inputs": [
                {
                    "name": "_merkleRoot",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "_proof",
                    "type": "bytes",
                    "internalType": "bytes"
                },
                {
                    "name": "_publicInputs",
                    "type": "bytes32[]",
                    "internalType": "bytes32[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "verifier",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "MerkleStorage__Update",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "merkleRoot",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                }
            ],
            "anonymous": false
        }
    ]
}