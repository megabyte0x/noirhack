import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import type { Hex } from 'viem';
import type { ProofData } from '@aztec/bb.js';
import { toHex } from 'viem';

import { verifyProof, updateMerkleRoot } from '../utils/contractCall';
import AddressInput from '../components/addressInput';
import styles from '../styles/Home.module.css';
import { getInputFields } from '../utils';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<Hex | undefined>(undefined);
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const [providerInfo, setProviderInfo] = useState<string>('');

  // Effect to log provider info
  useEffect(() => {
    const checkProviders = () => {
      try {
        const info = {
          hasEthereumProperty: typeof window !== 'undefined' && 'ethereum' in window,
          isMetaMaskAvailable: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
        };
        setProviderInfo(JSON.stringify(info, null, 2));
      } catch (err) {
        console.error('Error checking providers:', err);
      }
    };

    // Only run after mounting
    if (typeof window !== 'undefined') {
      // Add a small delay to allow providers to initialize
      setTimeout(checkProviders, 1000);
    }
  }, []);

  const handleAddressSubmit = async (address: Hex, signature?: Hex, messageHash?: Hex) => {
    setLoading(true);
    if (signature && messageHash) {
      let proofData: ProofData | null = null;
      let merkleRoot: Hex | null = null;
      let isValid: boolean | null = null;
      let proof: Hex | null = null;
      let hash: Hex | null = null;
      try {
        setSubmittedAddress(address);
        setSignature(signature);
        const inputFields = await getInputFields(signature, messageHash, address)
        proofData = inputFields.proofData;
        merkleRoot = inputFields.merkleRoot;
        proof = toHex(proofData.proof);

        isValid = await verifyProof(proof, proofData.publicInputs);

        if (isValid) {
          console.log("Proof verified successfully ✅");
        } else {
          console.log("Proof verification failed ❌");
        }
      } catch (error) {
        console.error('Error submitting address:', error);
      } finally {
        setLoading(false);
      }
      if (isValid && proof && merkleRoot && proofData) {
        try {
          hash = await updateMerkleRoot(merkleRoot, proof, proofData.publicInputs);
        } catch (error) {
          console.error('Error updating merkle root:', error);
        }
      }

      if (hash) {
        console.log("Merkle root updated successfully ✅");
        console.log(`https://base-sepolia.blockscout.com/tx/${hash}`);
      } else {
        console.log("Merkle root update failed ❌");
      }
    } else {
      console.error('Signature or message hash is undefined');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>TruScore</title>
        <meta
          content="Privacy-preserving on-chain reputation system"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <span style={{ color: '#0d76fc' }}>TruScore</span>
        </h1>

        <p className={styles.description}>
          A privacy-preserving on-chain reputation system
        </p>

        {providerInfo && process.env.NEXT_PUBLIC_ENV === 'dev' && (
          <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '20px', maxWidth: '600px' }}>
            <h3>Provider Info:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{providerInfo}</pre>
          </div>
        )}

        <div className={styles.card} style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
          <h2>Link Your Wallet Address</h2>
          <p>Enter an Ethereum address to link with your profile</p>

          <AddressInput
            onSubmit={handleAddressSubmit}
            buttonText="Link Address"
            isLoading={loading}
          />

          {signature && (
            <div className={styles.successMessage}>
              <p>✅ Address linked successfully: <span style={{ fontWeight: 'bold' }}>{submittedAddress}</span></p>
              {signature && (
                <p className={styles.signatureInfo}>
                  Signature verified: <span style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>{signature}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/your-repo" rel="noopener noreferrer" target="_blank">
          TruScore - Privacy First Reputation System
        </a>
      </footer>
    </div>
  );
};

export default Home;
