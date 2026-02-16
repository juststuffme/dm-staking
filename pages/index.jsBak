import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';

// Dynamic import for wallet button to avoid SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>🧐 Democracy Manifest</h1>
        <h2 className={styles.subtitle}>$DM Token Staking</h2>
        <p className={styles.description}>
          Earn rewards by staking your $DM tokens
        </p>
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
          
          <div className={styles.stakingSection}>
            <h4>Staking Platform</h4>
            <p>Our staking platform is being built. Coming soon!</p>
            
            <div className={styles.tiers}>
              <div className={styles.tier}>
                <div className={styles.tierIcon}>🔒</div>
                <h5>30 Days</h5>
                <p className={styles.apy}>15% APY</p>
              </div>
              <div className={styles.tier}>
                <div className={styles.tierIcon}>💎</div>
                <h5>60 Days</h5>
                <p className={styles.apy}>20% APY</p>
              </div>
              <div className={styles.tier}>
                <div className={styles.tierIcon}>👑</div>
                <h5>90 Days</h5>
                <p className={styles.apy}>30% APY</p>
              </div>
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

      <footer className={styles.footer}>
        <p>Democracy Manifest ($DM) • Solana Devnet</p>
        <p className={styles.programId}>
          Program: 23bftT4td2YVTRz2AX73dpVEPoAVPA8RSGssu7By5X7U
        </p>
      </footer>
    </div>
  );
}
