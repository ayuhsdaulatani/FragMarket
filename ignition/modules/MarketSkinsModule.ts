import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PRODUCT_IDS = [1001n, 1002n, 1003n, 1004n, 1005n, 1006n];
const PRICES_YODA = [12500n, 8200n, 950n, 420n, 1100n, 24000n];

export default buildModule("MarketSkinsModule", (m) => {
  const seller = m.getAccount(0);

  const yoda = m.contract("YodaToken", [seller]);
  const nft = m.contract("MarketSkinsNFT", []);
  const market = m.contract("SkinMarket", [yoda, nft, seller]);

  for (let i = 0; i < PRODUCT_IDS.length; i++) {
    m.call(nft, "mintItem", [seller, PRODUCT_IDS[i]], { id: `mint_${i}` });
  }

  m.call(nft, "setApprovalForAll", [market, true], { id: "nft_approve_market" });

  const exp = 10n ** 18n;
  for (let i = 0; i < PRODUCT_IDS.length; i++) {
    const priceWei = PRICES_YODA[i] * exp;
    m.call(market, "listItem", [BigInt(i), priceWei, PRODUCT_IDS[i]], { id: `list_${i}` });
  }

  return { yoda, nft, market };
});
