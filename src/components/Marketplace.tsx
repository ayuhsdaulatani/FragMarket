import type { CSSProperties } from "react";

export type MarketItem = {
  id: string;
  title: string;
  subtitle: string;
  priceYoda: string;
  accent: string;
};

const DEMO_ITEMS: MarketItem[] = [
  {
    id: "1",
    title: "AWP | Dragon Lore",
    subtitle: "Factory New · CS2",
    priceYoda: "12,500",
    accent: "#ff6b35",
  },
  {
    id: "2",
    title: "Karambit | Fade",
    subtitle: "Minimal Wear",
    priceYoda: "8,200",
    accent: "#c084fc",
  },
  {
    id: "3",
    title: "Steam Wallet $50",
    subtitle: "Digital voucher · Region US",
    priceYoda: "950",
    accent: "#38bdf8",
  },
  {
    id: "4",
    title: "AK-47 | Redline",
    subtitle: "Field-Tested",
    priceYoda: "420",
    accent: "#f43f5e",
  },
  {
    id: "5",
    title: "Valorant 5350 VP",
    subtitle: "Top-up code",
    priceYoda: "1,100",
    accent: "#facc15",
  },
  {
    id: "6",
    title: "M4A4 | Howl",
    subtitle: "Contraband · Showcase",
    priceYoda: "24,000",
    accent: "#34d399",
  },
];

function onBuyDemo(item: MarketItem): void {
  window.alert(
    `Demo only — "${item.title}" for ${item.priceYoda} YODA.\n` +
      "Wire this button to your marketplace contract when you're ready."
  );
}

export function Marketplace() {
  return (
    <section className="market-section">
      <header className="market-header">
        <div>
          <h2>MarketSkins floor</h2>
          <p className="subtle">Digital loot & vouchers — priced in Yoda (Sepolia demo)</p>
        </div>
      </header>
      <div className="asset-grid">
        {DEMO_ITEMS.map((item) => (
          <article
            key={item.id}
            className="asset-card"
            style={{ "--accent": item.accent } as CSSProperties}
          >
            <div className="asset-art" aria-hidden />
            <div className="asset-body">
              <h3 className="asset-title">{item.title}</h3>
              <p className="asset-sub">{item.subtitle}</p>
              <div className="asset-row">
                <span className="price-label">Price in Yoda</span>
                <span className="price-value">{item.priceYoda} YODA</span>
              </div>
              <button type="button" className="btn buy" onClick={() => onBuyDemo(item)}>
                Buy Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
