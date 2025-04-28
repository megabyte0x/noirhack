import { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../../styles/AddressInput.module.css';
import { signTypedData, verifyTypedData } from '@wagmi/core';
import { config } from '../../wagmi';
import { types, domain, message, typedDataHash } from './utils';
import type { AddressInputProps, LinkWalletMessage } from './types';
import type { Hex } from 'viem';
const AddressInput = ({
    onSubmit,
    buttonText = 'Submit',
    placeholder = 'Enter ETH address (0x...)',
    isLoading = false,
}: AddressInputProps) => {
    const [address, setAddress] = useState<Hex>('0xdDCc06f98A7C71Ab602b8247d540dA5BD8f5D2A2');
    const [error, setError] = useState('');
    const [signature, setSignature] = useState<Hex | null>(null);
    const [messageToSign, setMessageToSign] = useState<LinkWalletMessage | null>(null);
    const [messageHash, setMessageHash] = useState<Hex | null>(null);
    const [pendingSignature, setPendingSignature] = useState<Hex | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const submissionProcessed = useRef(false);

    // Memoize the validation function to avoid recreating it on every render
    const validateAddress = useCallback((value: string): boolean => {
        if (!value) {
            setError('Address is required');
            return false;
        }

        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(value)) {
            setError('Invalid Ethereum address format');
            return false;
        }

        setError('');
        return true;
    }, []);

    const signMessage = async () => {
        // Create the message with current timestamp
        const msgToSign = message(address);
        const typedData = {
            account: address,
            domain,
            types,
            primaryType: 'LinkWallet' as const,
            message: msgToSign,
        }
        const messageHash = typedDataHash(typedData);
        setMessageToSign(msgToSign);

        // Trigger signature request
        let signature: Hex | null = null;

        try {
            signature = await signTypedData(config, typedData);
        } catch (error) {
            console.error('Error signing message:', error);
            setError('Failed to sign message. Please try again.');
        }


        return { signature, messageHash };
    }

    const verifySignature = useCallback(async (signature: Hex) => {
        let result = false;

        // Must use the exact same message that was signed (same timestamp)
        if (!messageToSign) {
            setError('Verification failed: no message available');
            return false;
        }

        try {
            result = await verifyTypedData(config, {
                address: address,
                signature: signature,
                domain,
                types,
                primaryType: 'LinkWallet',
                message: messageToSign,
            });
        } catch (error) {
            console.error('Error verifying signature:', error);
            setError('Failed to verify signature. Please try again.');
        }
        return result;
    }, [address, messageToSign]);

    // Effect to verify signature after messageToSign is updated
    useEffect(() => {
        const verifyPendingSignature = async () => {
            if (messageToSign && pendingSignature) {
                const verified = await verifySignature(pendingSignature);
                if (verified) {
                    setSignature(pendingSignature);
                    setPendingSignature(null); // Clear pending signature
                    setIsVerified(true);
                } else {
                    console.error('Signature verification failed');
                    setError('Signature verification failed. Please try again.');
                }
            }
        };

        verifyPendingSignature();
    }, [messageToSign, pendingSignature, verifySignature]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateAddress(address)) {
            try {
                // Reset submission flag when starting a new submission
                submissionProcessed.current = false;

                // Create message with timestamp and get signature
                const { signature, messageHash } = await signMessage();
                if (signature !== null) {
                    // Set the pending signature to trigger verification in useEffect
                    setPendingSignature(signature);
                    setMessageHash(messageHash);
                } else {
                    console.log('signature is null');
                }
            } catch (error) {
                console.error('Error signing message:', error);
                setError('Failed to sign message. Please try again.');
            }
        }
    };

    // Effect to handle signature updates
    useEffect(() => {
        if (validateAddress(address) && signature && isVerified && messageHash && !submissionProcessed.current) {
            console.log("Calling onSubmit - this should only happen once per submission");
            submissionProcessed.current = true;
            onSubmit(address, signature, messageHash);
        }
    }, [address, onSubmit, validateAddress, signature, isVerified, messageHash]);

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value as Hex);
                        if (error) validateAddress(e.target.value);
                    }}
                    placeholder={placeholder}
                    className={styles.input}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={styles.button}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : buttonText}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default AddressInput; 