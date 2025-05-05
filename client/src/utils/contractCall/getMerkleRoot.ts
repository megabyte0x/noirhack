import { readContract } from '@wagmi/core'
import { MERKLE_STORAGE_CONTRACT } from '../../contracts/MerkleStorage'
import { config } from '../../wagmi'
import type { Hex } from 'viem'

export async function getMerkleRoot(address: Hex) {

    try {
        const result = await readContract(config, {
            abi: MERKLE_STORAGE_CONTRACT.abi,
            address: MERKLE_STORAGE_CONTRACT.address as `0x${string}`,
            functionName: 'getMerkleRoot',
            args: [address]
        })

        console.log("Result:", result);


    } catch (error) {
        console.error(error)
    }
}