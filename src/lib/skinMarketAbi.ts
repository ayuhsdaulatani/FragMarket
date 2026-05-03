export const SKIN_MARKET_ABI = [
  "function purchase(uint256 tokenId) external",
  "function listings(uint256 tokenId) view returns (uint256 price, uint256 productId, bool active)",
  "function seller() view returns (address)",
  "function yoda() view returns (address)",
  "event Purchased(address indexed buyer, uint256 indexed tokenId, uint256 productId, uint256 price)",
] as const;
