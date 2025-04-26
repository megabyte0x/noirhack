import { slice, recoverPublicKey } from "viem";
import type { Hex } from "viem";
import type { InputFields } from "./types";
import { generateCommitment } from "./generateCommitment";
import { generateNullifier } from "./generateNullifier";


function BigIntFromHex(hex: Hex): bigint {
    return BigInt(hex as string)
}

export const getInputFields = async (signature: Hex, messageHash: Hex, address: Hex): Promise<InputFields> => {
    const signatureWithoutPrefix = slice(signature, 1)
    const r = slice(signatureWithoutPrefix, 0, 32)
    const s = slice(signatureWithoutPrefix, 32, 64)

    let pubKeyHex: Hex = "0x";

    try {
        pubKeyHex = await recoverPublicKey({
            hash: messageHash,
            signature: signature
        })
    } catch (error) {
        console.error('Error recovering public key:', error);
    }

    const pubKeyWithoutPrefix = slice(pubKeyHex, 1)
    const pubKeyX = slice(pubKeyWithoutPrefix, 0, 32)
    const pubKeyY = slice(pubKeyWithoutPrefix, 32, 64)

    const nullifier = generateNullifier()
    const commitment = generateCommitment(nullifier, address)

    return { r: BigIntFromHex(r), s: BigIntFromHex(s), pubKeyX: BigIntFromHex(pubKeyX), pubKeyY: BigIntFromHex(pubKeyY), address, nullifier, commitment }
}