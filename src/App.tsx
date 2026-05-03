import { BrowserProvider, type JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { Marketplace } from "./components/Marketplace";
import { TokenBalance } from "./components/TokenBalance";
import { contractsConfigured } from "./lib/contractEnv";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    if (!provider) {
      setSigner(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const s = await provider.getSigner();
        if (!cancelled) setSigner(s);
      } catch {
        if (!cancelled) setSigner(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provider, address]);

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="top-bar">
        <div className="brand">
          <span className="logo-mark">MS</span>
          <div>
            <h1>MarketSkins</h1>
            <p className="tagline">YODA + NFT marketplace</p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="sidebar">
          <ConnectWallet
            address={address}
            onAddressChange={setAddress}
            onProviderChange={setProvider}
          />
          <TokenBalance provider={provider} signer={signer} userAddress={address} />
        </div>
        <Marketplace provider={provider} signer={signer} userAddress={address} />
      </main>

      <footer className="footer subtle">
        <p>
          {contractsConfigured()
            ? "Ready — connect wallet and buy with YODA."
            : "Set .env from Ignition deploy output, then restart dev."}
        </p>
      </footer>
    </div>
  );
}
