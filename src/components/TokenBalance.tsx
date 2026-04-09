import {
  Contract,
  type BrowserProvider,
  type InterfaceAbi,
  formatUnits,
  isAddress,
} from "ethers";
import { useCallback, useState } from "react";
import { DEFAULT_ERC20_ABI } from "../lib/defaultErc20Abi";

type Props = {
  provider: BrowserProvider | null;
  userAddress: string | null;
};

const ABI_PLACEHOLDER = `Paste your Yoda token ABI as JSON, or leave empty to use a minimal ERC-20 ABI (balanceOf + decimals).`;

export function TokenBalance({ provider, userAddress }: Props) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [abiText, setAbiText] = useState("");
  const [balanceLabel, setBalanceLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    setError(null);
    setBalanceLabel(null);

    if (!provider || !userAddress) {
      setError("Connect your wallet first.");
      return;
    }
    const addr = tokenAddress.trim();
    if (!addr || !isAddress(addr)) {
      setError("Enter a valid Yoda token contract address (checksummed or lowercase).");
      return;
    }

    let abi: InterfaceAbi;
    if (!abiText.trim()) {
      abi = DEFAULT_ERC20_ABI as unknown as InterfaceAbi;
    } else {
      try {
        const parsed: unknown = JSON.parse(abiText);
        if (!Array.isArray(parsed)) throw new Error("ABI must be a JSON array.");
        abi = parsed as InterfaceAbi;
      } catch {
        setError("ABI must be valid JSON array (export from Remix / Hardhat).");
        return;
      }
    }

    setLoading(true);
    try {
      const contract = new Contract(addr, abi, provider);
      const [rawBalance, decimals] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals().catch(() => 18),
      ]);
      let sym = "YODA";
      try {
        sym = await contract.symbol();
      } catch {
        /* optional */
      }
      const formatted = formatUnits(rawBalance, Number(decimals));
      const display = formatted.replace(/\.?0+$/, "");
      setBalanceLabel(`${display || "0"} ${sym}`);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not read balance. Check network and ABI.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [provider, userAddress, tokenAddress, abiText]);

  return (
    <section className="panel token-panel">
      <header className="panel-header">
        <h2>Yoda balance</h2>
        <span className="badge subtle">read-only</span>
      </header>
      <label className="field">
        <span className="label">Yoda token contract address</span>
        <input
          className="input mono"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
        />
      </label>
      <label className="field">
        <span className="label">Token ABI (JSON)</span>
        <textarea
          className="input mono abi-input"
          value={abiText}
          onChange={(e) => setAbiText(e.target.value)}
          placeholder={ABI_PLACEHOLDER}
          spellCheck={false}
        />
      </label>
      <button
        type="button"
        className="btn secondary"
        onClick={fetchBalance}
        disabled={loading || !userAddress}
      >
        {loading ? "Fetching…" : "Fetch balance"}
      </button>
      {balanceLabel ? (
        <div className="balance-result">
          <p className="label">Your balance</p>
          <p className="balance-value">{balanceLabel}</p>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
