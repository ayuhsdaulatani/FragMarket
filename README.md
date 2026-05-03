# FragMarket / MarketSkins

CSE term project: sell digital “skins” for YODA (ERC-20). NFTs are `MarketSkinsNFT`; payments go through `SkinMarket`. Frontend is Vite + React; contracts use Hardhat + Ignition (same general idea as the Ballot demo in class).

## Run the site locally

```
npm install
npm run dev
```

Put your deployed addresses in `.env` — copy from `.env.example`. Restart the dev server after you change `.env`.

## Contracts

```
npx hardhat compile
npx hardhat test
```

Deploy to Sepolia (need RPC + key in Hardhat keystore per `hardhat.config.ts`):

```
npm run deploy:sepolia
```

For a local chain: terminal 1 `npm run node:local`, terminal 2 `npm run deploy:local`, set `VITE_USE_LOCAL_CHAIN=true` in `.env`.

If you change prices or how many items are listed, update both `ignition/modules/MarketSkinsModule.ts` and the `LISTINGS` array in `src/components/Marketplace.tsx`, then **redeploy** so token ids / listings exist on-chain.

Card art lives in `public/skins/*.png` (replace with your own PNGs; keep filenames or update `image` paths in `Marketplace.tsx`).

## Submitting

Do not zip `node_modules`. If the course asks for a runnable zip, include source + `package-lock.json`, and say to run `npm install` first.
