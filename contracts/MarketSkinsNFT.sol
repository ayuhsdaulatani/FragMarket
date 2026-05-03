// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MarketSkinsNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(uint256 tokenId => uint256 productId) public productIdOfToken;

    constructor() ERC721("MarketSkins Asset", "MSKIN") Ownable(msg.sender) {}

    function mintItem(address to, uint256 productId) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId++;
        }
        _safeMint(to, tokenId);
        productIdOfToken[tokenId] = productId;
    }
}
