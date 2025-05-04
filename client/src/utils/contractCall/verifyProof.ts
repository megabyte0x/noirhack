import { simulateContract } from '@wagmi/core'
import { VERIFIER_CONTRACT } from '../../contracts/Verifier'
import { config } from '../../wagmi'
import type { Hex } from 'viem'

export async function verifyProof(proof: Hex, publicInputs: string[]): Promise<boolean> {
    let result = null;
    try {
        result = await simulateContract(config, {
            abi: VERIFIER_CONTRACT.abi,
            address: VERIFIER_CONTRACT.address as `0x${string}`,
            functionName: 'verify',
            args: [
                proof,
                publicInputs
            ],
        })
    } catch (error) {
        console.error(error)
    }

    if (result) {
        return result.result
    }

    return false;
}

