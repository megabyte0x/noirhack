import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import type { Hex } from 'viem';
import type { ProofData } from '@aztec/bb.js';
import { toHex } from 'viem';
import { useAccount } from 'wagmi';

import { verifyProof, updateMerkleRoot } from '../utils/contractCall';
import AddressInput from '../components/addressInput';
import styles from '../styles/Home.module.css';
import { getInputFields } from '../utils';

// Type definition for profile data in localStorage
type ProfileData = {
  profile: Hex;
  linked_wallets: Hex[];
  merkleRoot?: Hex;
  updated?: boolean;
  proof?: Hex;
  publicInputs?: Hex[];
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<Hex | undefined>(undefined);
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [updatingMerkleRoot, setUpdatingMerkleRoot] = useState(false);

  // Get the connected account using wagmi
  const { address, isConnected } = useAccount();

  // Effect to check for existing profile when wallet connects/changes
  useEffect(() => {
    if (isConnected && address) {
      // Check if we have a stored profile
      const savedData = localStorage.getItem('truscore_profile');

      if (savedData) {
        const parsedData: ProfileData = JSON.parse(savedData);
        setProfileData(parsedData);

        // Check if the connected wallet matches the stored profile address
        if (parsedData.profile.toLowerCase() !== address.toLowerCase()) {
          // If this wallet is not the profile wallet, check if it's in linked wallets
          const isLinkedWallet = parsedData.linked_wallets.some(
            wallet => wallet.toLowerCase() === address.toLowerCase()
          );

          if (!isLinkedWallet) {
            // New wallet connection that's not a linked wallet - ask to use as profile
            setShowProfileConfirm(true);
          }
        }
      } else {
        // No profile exists yet, ask to confirm using this wallet as profile
        setShowProfileConfirm(true);
      }
    }
  }, [address, isConnected]);

  // Effect to log provider info
  // useEffect(() => {
  //   const checkProviders = () => {
  //     try {
  //       const info = {
  //         hasEthereumProperty: typeof window !== 'undefined' && 'ethereum' in window,
  //         isMetaMaskAvailable: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  //       };
  //       setProviderInfo(JSON.stringify(info, null, 2));
  //     } catch (err) {
  //       console.error('Error checking providers:', err);
  //     }
  //   };

  //   // Only run after mounting
  //   if (typeof window !== 'undefined') {
  //     // Add a small delay to allow providers to initialize
  //     setTimeout(checkProviders, 1000);
  //   }
  // }, []);

  const updateMerkleRootOnChain = async (merkleRoot: Hex, proof: Hex, publicInputs: Hex[]) => {
    setUpdatingMerkleRoot(true);
    let hash: Hex | null = null;

    try {
      hash = await updateMerkleRoot(merkleRoot, proof, publicInputs);
    } catch (error) {
      console.error('Error updating merkle root:', error);
    } finally {
      setUpdatingMerkleRoot(false);
    }

    if (hash) {
      console.log("Merkle root updated successfully ✅");
      console.log(`https://base-sepolia.blockscout.com/tx/${hash}`);

      // Update the status in localStorage
      if (profileData) {
        const updatedProfileData: ProfileData = {
          ...profileData,
          updated: true
        };
        localStorage.setItem('truscore_profile', JSON.stringify(updatedProfileData));
        setProfileData(updatedProfileData);
      }

      return true;
    }

    console.log("Merkle root update failed ❌");
    return false;
  }

  const handleAddressSubmit = async (address: Hex, signature?: Hex, messageHash?: Hex) => {
    setLoading(true);
    if (!signature || !messageHash) {
      console.error('Signature or message hash is undefined');
      setLoading(false);
      return;
    }

    let proofData: ProofData | null = null;
    let merkleRoot: Hex | null = null;
    let isValid = false;
    let proof: Hex | null = null;
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

        // Add the submitted address to the linked wallets if not already present
        if (profileData && merkleRoot && proof) {
          const isAddressLinked = profileData.linked_wallets.some(
            wallet => wallet.toLowerCase() === address.toLowerCase()
          );

          const updatedLinkedWallets = isAddressLinked
            ? profileData.linked_wallets
            : [...profileData.linked_wallets, address];

          const updatedProfileData: ProfileData = {
            ...profileData,
            linked_wallets: updatedLinkedWallets,
            merkleRoot: merkleRoot,
            updated: false,
            proof: proof,
            publicInputs: proofData.publicInputs as Hex[]
          };

          // Save to localStorage
          localStorage.setItem('truscore_profile', JSON.stringify(updatedProfileData));
          setProfileData(updatedProfileData);

          console.log("Merkle root stored in local storage with status: not updated");
        }
      } else {
        console.log("Proof verification failed ❌");
      }
    } catch (error) {
      console.error('Error submitting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmUseAsProfile = () => {
    if (address) {
      // Create a new profile using this address
      const newProfileData: ProfileData = {
        profile: address as Hex,
        linked_wallets: []
      };

      // Save to localStorage
      localStorage.setItem('truscore_profile', JSON.stringify(newProfileData));
      setProfileData(newProfileData);
      setShowProfileConfirm(false);
    }
  };

  const cancelProfileConfirm = () => {
    setShowProfileConfirm(false);
  };

  // Check if connected wallet is the profile wallet
  const isProfileWallet = profileData?.profile && address &&
    profileData.profile.toLowerCase() === address.toLowerCase();

  // Check if there's an unupdated merkle root
  const hasUnupdatedMerkleRoot = profileData?.merkleRoot &&
    profileData.proof &&
    profileData.publicInputs &&
    profileData.updated === false;

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

        {/* Profile confirmation popup */}
        {showProfileConfirm && (
          <div className={styles.confirmPopup}>
            <h3>Set as Profile Address?</h3>
            <p>Would you like to use address <strong>{address}</strong> as your public profile address?</p>
            <div className={styles.confirmButtons}>
              <button type="button" onClick={confirmUseAsProfile} className={styles.confirmButton}>Yes, Use This Address</button>
              <button type="button" onClick={cancelProfileConfirm} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        )}

        {/* Show profile and linked wallets if they exist */}
        {profileData && (
          <div className={styles.profileInfo}>
            <h2>Your TruScore Profile</h2>
            <p><strong>Profile Address:</strong> {profileData.profile}</p>
            <h3>Linked Wallets ({profileData.linked_wallets.length})</h3>
            {profileData.linked_wallets.length > 0 ? (
              <ul className={styles.walletList}>
                {profileData.linked_wallets.map((wallet) => (
                  <li key={wallet}>{wallet}</li>
                ))}
              </ul>
            ) : (
              <p>No wallets linked yet. Use the form below to link a wallet.</p>
            )}
            {profileData.merkleRoot && (
              <div className={styles.merkleInfo}>
                <h3>Merkle Root</h3>
                <p style={{
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  maxWidth: '100%'
                }}>
                  {profileData.merkleRoot}
                </p>
                <p className={styles.updateStatus}>
                  Status: {profileData.updated ? 'Updated onchain ✅' : 'Not updated onchain ❌'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Check if connected wallet is already a linked wallet but not the profile wallet */}
        {profileData && address &&
          profileData.linked_wallets.some(wallet => wallet.toLowerCase() === address.toLowerCase()) &&
          profileData?.profile.toLowerCase() === address.toLowerCase() ? (
          <div className={styles.card} style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
            <h2>Wallet Already Linked</h2>
            <p>This wallet is already linked to your profile. Connect another wallet to link it with your profile.</p>
          </div>
        ) : (
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
        )}

        {/* Show update Merkle root button if conditions are met */}
        {isProfileWallet && hasUnupdatedMerkleRoot && profileData?.merkleRoot && profileData?.proof && profileData?.publicInputs && (
          <div className={styles.updateMerkleRootSection}>
            <button
              type="button"
              className={styles.updateMerkleRootButton}
              onClick={() => updateMerkleRootOnChain(
                profileData.merkleRoot as Hex,
                profileData.proof as Hex,
                profileData.publicInputs as Hex[]
              )}
              disabled={updatingMerkleRoot}
            >
              {updatingMerkleRoot ? 'Updating Merkle Root...' : 'Update Merkle Root On-Chain'}
            </button>
            <p className={styles.updateMerkleRootDescription}>
              Update your Merkle root on-chain to save your linked wallet information securely.
            </p>
          </div>
        )}
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
