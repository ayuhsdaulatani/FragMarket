import { BrowserProvider } from "ethers";
import { useState } from "react";
import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { Marketplace } from "./components/Marketplace";
import { TokenBalance } from "./components/TokenBalance";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="top-bar">
        <div className="brand">
          <span className="logo-mark">MS</span>
          <div>
            <h1>MarketSkins</h1>
            <p className="tagline">Decentralized loot market · Sepolia</p>
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
          <TokenBalance provider={provider} userAddress={address} />
        </div>
        <Marketplace />
      </main>

      <footer className="footer subtle">
        <p>
          Class project draft — read-only chain reads. Marketplace listings are static for UI demo.
        </p>
      </footer>
    </div>
  );
}
