# TruScore

## Overview

TruScore is the privacy first reputation score generated using on-chain data of the user while keeping the user's identity private.

It's an implementation of the https://onchainscore.xyz/ but with the following differences:

- It doesn't disclose the EVM addresses of the user.
- It doesn't disclose the social handles of the user like twitter,lens, github etc.
- Creates a dynamic NFT which will be minted to the user's choice of wallet.

## What problem does it solve?

Everyone has several addresses or social handles which they want to keep private. But keeping them private makes it hard to get a good reputation score.

## How does it work?

The flow of generating a reputation score is as follows:

1. User connect their wallet.
2. User ask to generate a score for a given address (0xabc) by signing a message with the same address(0xabc) ensuring the ownership of the address.
3. TruScore fetches the reputation using the [onchain score api](https://onchainscore.xyz/api) for the requested address.
4. TruScore generates a dynamic NFT with the score and mints it to the user's choice of wallet.

## Proving the address ownership

1. User connects their public address (megabyte.base.eth) and generate a profile if (101)
2. User add their private address (0xabc)
3. Now, the user needs to switch their wallet for signing to prove ownership of the wallet address.
4. After signature generation, a commitment and nullifier will be generated on the client and nullifier will be stored in the local storage.
5. The commitment hash will be stored in a Merkle tree, and the root of merkle tree will be stored on Smart Contract.
6. When a user request to update their onchain score, they will be requested to prove that they own **any one** of the linked wallet address(s).
7. The zk proof will be generated using circuit build with Noir. The circuit will verify the merkle root and generate proof.
8. The NFT will be minted after verification of the proof to the public wallet.
