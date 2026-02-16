import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Dynamically import wallet provider to avoid SSR issues
const WalletContextProvider = dynamic(
  () => import('../components/WalletContextProvider'),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <WalletContextProvider>
      <Component {...pageProps} />
    </WalletContextProvider>
  );
}
