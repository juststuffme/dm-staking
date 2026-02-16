import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

// Dynamic import for wallet button to avoid SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    
    // Placeholder for actual staking logic
    setTimeout(() => {
      alert(`Staking ${amount} $DM for ${duration} days at ${duration === 30 ? 15 : duration === 60 ? 20 : 30}% APY\n\nThis will be connected to the blockchain in Step 3!`);
      setLoading(false);
    }, 1500);
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
