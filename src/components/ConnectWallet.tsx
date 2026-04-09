import { BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { SEPOLIA_CHAIN_ID_HEX, SEPOLIA_DISPLAY } from "../lib/chain";

type Props = {
  address: string | null;
  onAddressChange: (addr: string | null) => void;
  onProviderChange: (provider: BrowserProvider | null) => void;
};

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

async function ensureSepolia(ethereum: NonNullable<Window["ethereum"]>): Promise<void> {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err ? (err as { code: number }).code : null;
    if (code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
      return;
    }
    throw err;
  }
}

export function ConnectWallet({ address, onAddressChange, onProviderChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshAccounts = useCallback(
    async (prov: BrowserProvider) => {
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      onAddressChange(addr);
    },
    [onAddressChange]
  );

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accs: unknown) => {
      const list = accs as string[] | undefined;
      if (!list?.length) {
        onAddressChange(null);
        return;
      }
      onAddressChange(list[0]);
    };

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
    };
  }, [onAddressChange]);

  const connect = async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask was not detected. Install the MetaMask extension and try again.");
      return;
    }
    setBusy(true);
    try {
      await ensureSepolia(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts", params: [] });
      const provider = new BrowserProvider(window.ethereum);
      onProviderChange(provider);
      await refreshAccounts(provider);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not connect wallet.";
      setError(msg);
      onProviderChange(null);
      onAddressChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel connect-panel">
      <header className="panel-header">
        <h2>Wallet</h2>
        <span className="badge">{SEPOLIA_DISPLAY}</span>
      </header>
      {!address ? (
        <button type="button" className="btn primary glow" onClick={connect} disabled={busy}>
          {busy ? "Connecting…" : "Connect Wallet"}
        </button>
      ) : (
        <div className="wallet-connected">
          <p className="label">Sepolia address</p>
          <p className="mono address-full">{address}</p>
          <p className="hint subtle">Short: {shortenAddress(address)}</p>
        </div>
      )}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
