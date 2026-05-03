import { getAddress, isAddress } from "ethers";

function pick(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export function envAddress(name: keyof ImportMetaEnv): string | null {
  const raw = pick(name);
  if (!raw || !isAddress(raw)) return null;
  try {
    return getAddress(raw);
  } catch {
    return null;
  }
}

export function contractsConfigured(): boolean {
  return (
    envAddress("VITE_YODA_TOKEN_ADDRESS") !== null &&
    envAddress("VITE_SKIN_MARKET_ADDRESS") !== null
  );
}
