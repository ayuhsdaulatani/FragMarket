import {
  Contract,
  type BrowserProvider,
  type JsonRpcSigner,
  formatUnits,
  isAddress,
  parseUnits,
} from "ethers";
import { useCallback, useEffect, useState } from "react";
import { HARDHAT_LOCAL_CHAIN_ID, SEPOLIA_CHAIN_ID, TARGET_CHAIN_ID } from "../lib/chain";
import { envAddress } from "../lib/contractEnv";
import { DEFAULT_ERC20_ABI } from "../lib/defaultErc20Abi";

type Props = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  userAddress: string | null;
};

export function TokenBalance({ provider, signer, userAddress }: Props) {
  const fromEnv = envAddress("VITE_YODA_TOKEN_ADDRESS");
  const [walletChainId, setWalletChainId] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState(fromEnv ?? "");
  const [balanceLabel, setBalanceLabel] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("10000");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addr = (fromEnv ?? tokenAddress).trim();

  useEffect(() => {
    if (!provider) {
      setWalletChainId(null);
      return;
    }
    void provider.getNetwork().then((n) => setWalletChainId(n.chainId.toString()));
  }, [provider, userAddress]);

  const fetchBalance = useCallback(async () => {
    setError(null);
    setOkMsg(null);
    setBalanceLabel(null);
    if (!provider || !userAddress) {
      setError("Connect your wallet first.");
      return;
    }
    if (!addr || !isAddress(addr)) {
      setError("Set VITE_YODA_TOKEN_ADDRESS in .env or paste a valid token address.");
      return;
    }
    const net = await provider.getNetwork();
    if (net.chainId !== TARGET_CHAIN_ID) {
      const want =
        TARGET_CHAIN_ID === SEPOLIA_CHAIN_ID
          ? "Sepolia (11155111)"
          : `Hardhat local (${HARDHAT_LOCAL_CHAIN_ID.toString()})`;
      setError(
        `Wrong network in MetaMask for this site build. Site expects ${want}, wallet is on chain ${net.chainId.toString()}. Switch networks, then refresh balance.`,
      );
      return;
    }
    setLoading(true);
    try {
      const c = new Contract(addr, DEFAULT_ERC20_ABI, provider);
      const [raw, decimals] = await Promise.all([
        c.balanceOf(userAddress),
        c.decimals().catch(() => 18),
      ]);
      let sym = "YODA";
      try {
        sym = await c.symbol();
      } catch {}
      const formatted = formatUnits(raw, Number(decimals));
      const display = formatted.replace(/\.?0+$/, "");
      setBalanceLabel(`${display || "0"} ${sym}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read balance.");
    } finally {
      setLoading(false);
    }
  }, [addr, provider, userAddress]);

  const sendYoda = useCallback(async () => {
    setError(null);
    setOkMsg(null);
    if (!signer || !userAddress) {
      setError("Connect your wallet first.");
      return;
    }
    if (provider) {
      const net = await provider.getNetwork();
      if (net.chainId !== TARGET_CHAIN_ID) {
        setError("Switch MetaMask to the network this app is configured for, then try again.");
        return;
      }
    }
    if (!addr || !isAddress(addr)) {
      setError("Need a valid Yoda token address.");
      return;
    }
    const to = sendTo.trim();
    if (!to || !isAddress(to)) {
      setError("Enter a valid recipient.");
      return;
    }
    let value;
    try {
      value = parseUnits(sendAmt.trim() || "0", 18);
    } catch {
      setError("Enter a valid amount.");
      return;
    }
    if (value <= 0n) {
      setError("Amount must be > 0.");
      return;
    }
    setLoading(true);
    try {
      const c = new Contract(addr, DEFAULT_ERC20_ABI, signer);
      const tx = await c.transfer(to, value);
      await tx.wait();
      setSendTo("");
      setOkMsg("Transfer confirmed. In MetaMask open the Activity tab on this network to see the transaction.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed.");
    } finally {
      setLoading(false);
    }
  }, [addr, sendAmt, sendTo, signer, userAddress]);

  return (
    <section className="panel token-panel">
      <header className="panel-header">
        <h2>Yoda</h2>
        <span className="badge subtle">ERC-20</span>
      </header>

      {walletChainId ? (
        <p className="hint subtle mono" style={{ marginTop: 0 }}>
          Wallet chain id: {walletChainId} (app expects {TARGET_CHAIN_ID.toString()})
        </p>
      ) : null}

      {!fromEnv ? (
        <label className="field">
          <span className="label">Token address</span>
          <input
            className="input mono"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x…"
            spellCheck={false}
          />
        </label>
      ) : (
        <p className="hint subtle mono" style={{ marginTop: 0 }}>
          {addr}
        </p>
      )}

      <p className="hint subtle">
        <strong>Gas</strong> is paid in native ETH (on Sepolia that is SepoliaETH). <strong>Items</strong> are
        paid in YODA inside the contract calls, so MetaMask may still show an ETH fee even though the price
        is YODA. After you sign, check <strong>MetaMask → Activity</strong>. Import the token address above to
        see YODA under Tokens.
      </p>

      <button
        type="button"
        className="btn secondary"
        onClick={() => void fetchBalance()}
        disabled={loading || !userAddress}
      >
        {loading ? "…" : "Refresh balance"}
      </button>
      {balanceLabel ? (
        <div className="balance-result">
          <p className="label">Your balance</p>
          <p className="balance-value">{balanceLabel}</p>
        </div>
      ) : null}

      <hr className="panel-divider" />

      <p className="hint subtle">Treasurer: pay a classmate (e.g. 10,000 YODA).</p>
      <label className="field">
        <span className="label">To</span>
        <input
          className="input mono"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
        />
      </label>
      <label className="field">
        <span className="label">Amount</span>
        <input
          className="input mono"
          value={sendAmt}
          onChange={(e) => setSendAmt(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn secondary"
        onClick={() => void sendYoda()}
        disabled={loading || !userAddress}
      >
        Send
      </button>
      {okMsg ? <p className="success">{okMsg}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
