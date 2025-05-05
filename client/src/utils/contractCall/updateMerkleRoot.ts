import { simulateContract, writeContract } from '@wagmi/core'
import { MERKLE_STORAGE_CONTRACT } from '../../contracts/MerkleStorage'
import { config } from '../../wagmi'
import type { Hex } from 'viem'

export async function updateMerkleRoot(merkleRoot: Hex, proof: Hex, publicInputs: string[]): Promise<Hex> {

    let request = null;
    let hash: Hex = "0x";

    try {
        const result = await simulateContract(config, {
            abi: MERKLE_STORAGE_CONTRACT.abi,
            address: MERKLE_STORAGE_CONTRACT.address as `0x${string}`,
            functionName: 'updateMerkleRoot',
            args: [
                merkleRoot,
                proof,
                publicInputs
            ]
        })

        request = result.request;
    } catch (error) {
        console.error(error)
    }

    if (request) {
        try {
            hash = await writeContract(config, request)
            return hash;
        } catch (error) {
            console.error(error)
        }
    }


    return hash;

}