export const SEPOLIA_CHAIN_ID = 11155111n;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const HARDHAT_LOCAL_CHAIN_ID = 31337n;
export const HARDHAT_LOCAL_CHAIN_ID_HEX = "0x7a69";

const useLocal =
  typeof import.meta.env.VITE_USE_LOCAL_CHAIN === "string" &&
  import.meta.env.VITE_USE_LOCAL_CHAIN === "true";

export const TARGET_CHAIN_ID = useLocal ? HARDHAT_LOCAL_CHAIN_ID : SEPOLIA_CHAIN_ID;
export const TARGET_CHAIN_ID_HEX = useLocal ? HARDHAT_LOCAL_CHAIN_ID_HEX : SEPOLIA_CHAIN_ID_HEX;

export const TARGET_CHAIN_DISPLAY = useLocal
  ? "Hardhat local (31337)"
  : "Sepolia (11155111)";
