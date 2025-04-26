import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import AddressInput from '../components/addressInput';
import styles from '../styles/Home.module.css';
import { getInputFields } from '../utils';
import type { Hex } from 'viem';
import type { InputFields } from '../utils/types';
const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<Hex | undefined>(undefined);
  const [signature, setSignature] = useState<Hex | undefined>(undefined);

  const inputFields = (r: bigint, s: bigint, pubKeyX: bigint, pubKeyY: bigint, address: Hex, nullifier: bigint, commitment: bigint) => {
    console.log("r", r)
    console.log("s", s)
    console.log("pubKeyX", pubKeyX)
    console.log("pubKeyY", pubKeyY)
    console.log("address", address)
    console.log("nullifier", nullifier)
    console.log("commitment", commitment)
  }

  const handleAddressSubmit = async (address: Hex, signature?: Hex, messageHash?: Hex) => {
    setLoading(true);
    if (signature && messageHash) {
      let data: InputFields | undefined;
      try {
        setSubmittedAddress(address);
        setSignature(signature);
        data = await getInputFields(signature, messageHash, address)
      } catch (error) {
        console.error('Error submitting address:', error);
      } finally {
        setLoading(false);
      }
      if (data) {
        const r = data.r;
        const s = data.s;
        const pubKeyX = data.pubKeyX;
        const pubKeyY = data.pubKeyY;
        const nullifier = data.nullifier
        const commitment = data.commitment
        inputFields(r, s, pubKeyX, pubKeyY, address, nullifier, commitment)
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
