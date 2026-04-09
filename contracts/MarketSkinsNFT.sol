// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MarketSkinsNFT
/// @notice Boilerplate ERC-721 for digital marketplace assets (skins, vouchers, etc.).
/// @dev Each mint gets a sequential `tokenId`; your `productId` is stored for off-chain / indexer metadata.
contract MarketSkinsNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(uint256 tokenId => uint256 productId) public productIdOfToken;

    constructor() ERC721("MarketSkins Asset", "MSKIN") Ownable(msg.sender) {}

    /// @notice Mint a new asset to `to` and tag it with your catalog `productId`.
    /// @param to Recipient wallet (buyer or escrow, depending on your flow).
    /// @param productId Unique identifier from your product catalog (SKU / hash / DB id).
    /// @return tokenId The newly minted ERC-721 id.
    function mintItem(address to, uint256 productId) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId++;
        }
        _safeMint(to, tokenId);
        productIdOfToken[tokenId] = productId;
    }
}
