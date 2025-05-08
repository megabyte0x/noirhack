import { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../../styles/AddressInput.module.css';
import { signTypedData, verifyTypedData } from '@wagmi/core';
import { config } from '../../wagmi';
import { types, domain, message, typedDataHash } from './utils';
import type { AddressInputProps, LinkWalletMessage } from './types';
import type { Hex } from 'viem';
import { useAccount } from 'wagmi';

const AddressInput = ({
    onSubmit,
    buttonText = 'Link Wallet',
    placeholder = 'Connect wallet to link address',
    isLoading = false,
}: AddressInputProps) => {
    const { address: connectedAddress, isConnected } = useAccount();
    const [error, setError] = useState('');
    const [signature, setSignature] = useState<Hex | null>(null);
    const [messageToSign, setMessageToSign] = useState<LinkWalletMessage | null>(null);
    const [messageHash, setMessageHash] = useState<Hex | null>(null);
    const [pendingSignature, setPendingSignature] = useState<Hex | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const submissionProcessed = useRef(false);

    // Memoize the validation function to avoid recreating it on every render
    const validateAddress = useCallback((value: string | undefined): boolean => {
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
        if (!connectedAddress) return { signature: null, messageHash: null };

        // Create the message with current timestamp
        const msgToSign = message(connectedAddress);
        const typedData = {
            account: connectedAddress,
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

        if (!connectedAddress) return false;

        // Must use the exact same message that was signed (same timestamp)
        if (!messageToSign) {
            setError('Verification failed: no message available');
            return false;
        }

        try {
            result = await verifyTypedData(config, {
                address: connectedAddress,
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
    }, [connectedAddress, messageToSign]);

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
        if (!connectedAddress) {
            setError('Please connect your wallet first');
            return;
        }

        if (validateAddress(connectedAddress)) {
            try {
                // Reset submission flag when starting a new submission
                submissionProcessed.current = false;

                // Create message with timestamp and get signature
                const { signature, messageHash } = await signMessage();
                if (signature !== null && messageHash !== null) {
                    // Set the pending signature to trigger verification in useEffect
                    setPendingSignature(signature);
                    setMessageHash(messageHash);
                } else {
                    console.log('signature or messageHash is null');
                }
            } catch (error) {
                console.error('Error signing message:', error);
                setError('Failed to sign message. Please try again.');
            }
        }
    };

    // Effect to handle signature updates
    useEffect(() => {
        if (connectedAddress && validateAddress(connectedAddress) && signature && isVerified && messageHash && !submissionProcessed.current) {
            console.log("Calling onSubmit - this should only happen once per submission");
            submissionProcessed.current = true;
            onSubmit(connectedAddress, signature, messageHash);
        }
    }, [connectedAddress, onSubmit, validateAddress, signature, isVerified, messageHash]);

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <div className={styles.addressDisplay}>
                    {isConnected && connectedAddress ? (
                        <span>{connectedAddress}</span>
                    ) : (
                        <span className={styles.placeholder}>{placeholder}</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={styles.button}
                    disabled={isLoading || !isConnected}
                >
                    {isLoading ? 'Loading...' : buttonText}
                </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default AddressInput; 