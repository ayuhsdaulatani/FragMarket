/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YODA_TOKEN_ADDRESS?: string;
  readonly VITE_SKIN_MARKET_ADDRESS?: string;
  readonly VITE_USE_LOCAL_CHAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
