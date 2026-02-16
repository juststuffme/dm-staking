import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import styles from '../styles/Home.module.css';
import idl from '../public/idl.json';

// Dynamic import for wallet button to avoid SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const PROGRAM_ID = new web3.PublicKey('23bftT4td2YVTRz2AX73dpVEPoAVPA8RS6ssu7By5X7U');
const TOKEN_MINT = new web3.PublicKey('42yfxP81kcKK4hv6rrS44RXGXs9PPVGjaCT6ggyAcUzC'); // $DM token

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    if (publicKey && connection) {
      const provider = new AnchorProvider(
        connection,
        window.solana,
        { commitment: 'confirmed' }
      );
      const program = new Program(idl, PROGRAM_ID, provider);
      setProgram(program);
    }
  }, [publicKey, connection]);

  // Calculate rewards based on APY and duration
  const calculateRewards = () => {
    if (!amount || parseFloat(amount) <= 0) return '0';
    
    const apy = duration === 30 ? 15 : duration === 60 ? 20 : 30;
    const principal = parseFloat(amount);
    
    // Formula: (amount * apy * days) / (365 * 100)
    const rewards = (principal * apy * duration) / 36500;
    
    return rewards.toFixed(2);
  };

  const handleStake = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!program) {
      alert('Program not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    
    try {
      // Convert amount to proper format (with decimals)
      const amountBN = new BN(parseFloat(amount) * 1_000_000_000); // 9 decimals for SPL tokens
      
      // Derive PDAs
      const [poolPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('pool')],
        PROGRAM_ID
      );

      const timestamp = Math.floor(Date.now() / 1000);
      const [stakeInfoPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('stake'),
          publicKey.toBuffer(),
          Buffer.from(timestamp.toString().padStart(8, '0'))
        ],
        PROGRAM_ID
      );

      // Get user's token account
      const userTokenAccount = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: TOKEN_MINT }
      );

      if (userTokenAccount.value.length === 0) {
        alert('You don\'t have any $DM tokens. Please get some $DM first!');
        setLoading(false);
        return;
      }

      const userToken = userTokenAccount.value[0].pubkey;

      // Get vault account (you'll need to create this first)
      // For now, this is a placeholder - in production, initialize this properly
      const vaultPda = poolPda; // Simplified for testing

      // Call the stake instruction
      const tx = await program.methods
        .stake(amountBN, duration)
        .accounts({
          pool: poolPda,
          stakeInfo: stakeInfoPda,
          vault: vaultPda,
          userToken: userToken,
          user: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      alert(`✅ Success! Staked ${amount} $DM for ${duration} days\n\nTransaction: ${tx}\n\nView on Solscan (devnet)`);
      setAmount('');
      
    } catch (error) {
      console.error('Staking error:', error);
      alert(`❌ Staking failed: ${error.message}\n\nMake sure:\n1. Pool is initialized\n2. You have enough $DM tokens\n3. You're on devnet`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section with Header Graphic */}
      <div className={styles.hero}>
        <img src="/header.png" alt="Welcome to the Yield Manifest" className={styles.heroImage} />
      </div>

      <div className={styles.walletSection}>
        <WalletMultiButtonDynamic />
      </div>

      {publicKey ? (
        <div className={styles.card}>
          <h3>✅ Wallet Connected</h3>
          <p className={styles.address}>
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </p>
          
          <div className={styles.stakingInterface}>
            <h4>Stake Your $DM Tokens</h4>
            
            {/* Amount Input */}
            <div className={styles.inputGroup}>
              <label>Amount to Stake</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount of $DM"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>

            {/* Panel Graphic showing all 3 tiers */}
            <div className={styles.panelSection}>
              <img src="/panel.png" alt="Staking Tiers" className={styles.panelImage} />
            </div>

            {/* Duration Selector Buttons */}
            <div className={styles.durationButtons}>
              <button
                className={`${styles.durationBtn} ${duration === 30 ? styles.active : ''}`}
                onClick={() => setDuration(30)}
              >
                <div className={styles.durationLabel}>30 Days</div>
                <div className={styles.durationApy}>15% APY</div>
              </button>
              
              <button
                className={`${styles.durationBtn} ${duration === 60 ? styles.active : ''}`}
                onClick={() => setDuration(60)}
              >
                <div className={styles.durationLabel}>60 Days</div>
                <div className={styles.durationApy}>20% APY</div>
              </button>
              
              <button
                className={`${styles.durationBtn} ${duration === 90 ? styles.active : ''}`}
                onClick={() => setDuration(90)}
              >
                <div className={styles.durationLabel}>90 Days</div>
                <div className={styles.durationApy}>30% APY</div>
              </button>
            </div>

            {/* Rewards Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className={styles.rewardsPreview}>
                <div className={styles.rewardRow}>
                  <span>Staking Amount:</span>
                  <strong>{parseFloat(amount).toLocaleString()} $DM</strong>
                </div>
                <div className={styles.rewardRow}>
                  <span>Estimated Rewards:</span>
                  <strong className={styles.rewardAmount}>+{calculateRewards()} $DM</strong>
                </div>
                <div className={styles.rewardRow}>
                  <span>Total Return:</span>
                  <strong>{(parseFloat(amount) + parseFloat(calculateRewards())).toLocaleString()} $DM</strong>
                </div>
                <div className={styles.rewardRow}>
                  <span>Duration:</span>
                  <strong>{duration} days</strong>
                </div>
              </div>
            )}

            {/* Stake Button */}
            <button
              className={styles.stakeButton}
              onClick={handleStake}
              disabled={!amount || parseFloat(amount) <= 0 || loading}
            >
              {loading ? 'Processing...' : 'Stake Now'}
            </button>

            {/* Info */}
            <div className={styles.infoBox}>
              <h5>⚠️ Important Information</h5>
              <ul>
                <li>Tokens are locked for the selected duration</li>
                <li>Rewards are calculated automatically</li>
                <li>You can claim principal + rewards after the lock period</li>
                <li>No early withdrawal available</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <h3>Connect Your Wallet</h3>
          <p>Connect your Solana wallet to access staking</p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.icon}>⏰</span>
              <div>
                <strong>Time-Locked</strong>
                <p>Secure staking periods</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>💰</span>
              <div>
                <strong>High APY</strong>
                <p>Up to 30% rewards</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>🔐</span>
              <div>
                <strong>Audited</strong>
                <p>Secure smart contracts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Footer Graphic */}
      <footer className={styles.footer}>
        <img src="/footer.png" alt="Stake. Relax. Rule." className={styles.footerImage} />
        <p>Democracy Manifest ($DM) • Solana Devnet</p>
        <p className={styles.programId}>
          Program: 23bftT4td2YVTRz2AX73dpVEPoAVPA8RSGssu7By5X7U
        </p>
      </footer>
    </div>
  );
}
