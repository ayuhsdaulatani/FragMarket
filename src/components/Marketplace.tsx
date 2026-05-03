import type { CSSProperties } from "react";
import { Contract, type BrowserProvider, type JsonRpcSigner, MaxUint256 } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { contractsConfigured, envAddress } from "../lib/contractEnv";
import { DEFAULT_ERC20_ABI } from "../lib/defaultErc20Abi";
import { SKIN_MARKET_ABI } from "../lib/skinMarketAbi";

type Props = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  userAddress: string | null;
};

type Listing = {
  tokenId: bigint;
  productId: bigint;
  title: string;
  subtitle: string;
  priceYodaLabel: string;
  accent: string;
  priceWei: bigint;
  image: string;
};

const W = 10n ** 18n;

const LISTINGS: Listing[] = [
  {
    tokenId: 0n,
    productId: 1001n,
    title: "AWP | Dragon Lore",
    subtitle: "Factory New · CS2",
    priceYodaLabel: "12,500",
    accent: "#ff6b35",
    priceWei: 12500n * W,
    image: "/skins/awp-dragon-lore.png",
  },
  {
    tokenId: 1n,
    productId: 1002n,
    title: "Karambit | Fade",
    subtitle: "Minimal Wear",
    priceYodaLabel: "8,200",
    accent: "#c084fc",
    priceWei: 8200n * W,
    image: "/skins/karambit-fade.png",
  },
  {
    tokenId: 2n,
    productId: 1003n,
    title: "Steam Wallet $50",
    subtitle: "Digital voucher · Region US",
    priceYodaLabel: "950",
    accent: "#38bdf8",
    priceWei: 950n * W,
    image: "/skins/steam-wallet.png",
  },
  {
    tokenId: 3n,
    productId: 1004n,
    title: "AK-47 | Redline",
    subtitle: "Field-Tested",
    priceYodaLabel: "420",
    accent: "#f43f5e",
    priceWei: 420n * W,
    image: "/skins/ak47-redline.png",
  },
  {
    tokenId: 4n,
    productId: 1005n,
    title: "Valorant 5350 VP",
    subtitle: "Top-up code",
    priceYodaLabel: "1,100",
    accent: "#facc15",
    priceWei: 1100n * W,
    image: "/skins/valorant-vp.png",
  },
  {
    tokenId: 5n,
    productId: 1006n,
    title: "M4A4 | Howl",
    subtitle: "Contraband · Showcase",
    priceYodaLabel: "24,000",
    accent: "#34d399",
    priceWei: 24000n * W,
    image: "/skins/m4a4-howl.png",
  },
];

function cardStyle(accent: string): CSSProperties {
  return { "--accent": accent } as CSSProperties;
}

export function Marketplace({ provider, signer, userAddress }: Props) {
  const yoda = envAddress("VITE_YODA_TOKEN_ADDRESS");
  const marketAddr = envAddress("VITE_SKIN_MARKET_ADDRESS");
  const ready = contractsConfigured();

  const [sellerAddr, setSellerAddr] = useState<string | null>(null);
  const [activeByToken, setActiveByToken] = useState<Record<string, boolean>>({});
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !marketAddr) {
      setSellerAddr(null);
      return;
    }
    const m = new Contract(marketAddr, SKIN_MARKET_ABI, provider);
    void m
      .seller()
      .then((a: string) => setSellerAddr(a))
      .catch(() => setSellerAddr(null));
  }, [marketAddr, provider]);

  const refreshListings = useCallback(async () => {
    if (!provider || !marketAddr) return;
    const market = new Contract(marketAddr, SKIN_MARKET_ABI, provider);
    const next: Record<string, boolean> = {};
    await Promise.all(
      LISTINGS.map(async (l) => {
        try {
          const row = await market.listings(l.tokenId);
          next[l.tokenId.toString()] = row[2] as boolean;
        } catch {
          next[l.tokenId.toString()] = false;
        }
      }),
    );
    setActiveByToken(next);
    setListingsLoaded(true);
  }, [marketAddr, provider]);

  useEffect(() => {
    if (!marketAddr || !provider) {
      setListingsLoaded(false);
      return;
    }
    void refreshListings();
  }, [marketAddr, provider, refreshListings]);

  const buy = async (item: Listing) => {
    setMsg(null);
    setErr(null);
    if (!ready || !yoda || !marketAddr) {
      setErr("Add YODA + market addresses to .env (see .env.example), then restart npm run dev.");
      return;
    }
    if (!signer || !userAddress) {
      setErr("Connect your wallet.");
      return;
    }
    if (sellerAddr && userAddress.toLowerCase() === sellerAddr.toLowerCase()) {
      setErr("Use a different account than the seller to buy.");
      return;
    }

    setBusyId(item.tokenId.toString());
    try {
      const yodaC = new Contract(yoda, DEFAULT_ERC20_ABI, signer);
      if ((await yodaC.allowance(userAddress, marketAddr)) < item.priceWei) {
        await (await yodaC.approve(marketAddr, MaxUint256)).wait();
      }
      const market = new Contract(marketAddr, SKIN_MARKET_ABI, signer);
      await (await market.purchase(item.tokenId)).wait();
      setMsg(
        `You bought product #${item.productId.toString()} (token ${item.tokenId.toString()}). Check MetaMask → Activity for the transactions.`,
      );
      await refreshListings();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="market-section">
      <header className="market-header">
        <div>
          <h2>MarketSkins</h2>
          <p className="subtle">Pay in YODA → get the skin NFT.</p>
        </div>
      </header>

      {!ready ? (
        <p className="error">
          Deploy contracts, put <code className="mono">VITE_YODA_TOKEN_ADDRESS</code> and{" "}
          <code className="mono">VITE_SKIN_MARKET_ADDRESS</code> in <code className="mono">.env</code>, restart the dev server.
        </p>
      ) : null}

      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div className="asset-grid">
        {LISTINGS.map((item) => {
          const id = item.tokenId.toString();
          const isActive = listingsLoaded && activeByToken[id] === true;
          const isSold = listingsLoaded && activeByToken[id] === false;
          const busy = busyId === id;

          return (
            <article key={id} className="asset-card" style={cardStyle(item.accent)}>
              <div className="asset-thumb">
                <img src={item.image} alt="" loading="lazy" width={640} height={360} />
              </div>
              <div className="asset-body">
                <h3 className="asset-title">{item.title}</h3>
                <p className="asset-sub">{item.subtitle}</p>
                <p className="hint subtle mono">
                  #{item.productId.toString()} · token {id}
                </p>
                <div className="asset-row">
                  <span className="price-label">Price</span>
                  <span className="price-value">{item.priceYodaLabel} YODA</span>
                </div>
                <button
                  type="button"
                  className="btn buy"
                  disabled={!ready || !userAddress || busy || !listingsLoaded || !isActive}
                  onClick={() => void buy(item)}
                >
                  {!ready ? "Buy" : !listingsLoaded ? "…" : busy ? "…" : isSold ? "Sold" : "Buy"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
