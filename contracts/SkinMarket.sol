// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SkinMarket is ReentrancyGuard {
    IERC20 public immutable yoda;
    IERC721 public immutable skinNft;
    address public immutable seller;

    struct Listing {
        uint256 price;
        uint256 productId;
        bool active;
    }

    mapping(uint256 tokenId => Listing) public listings;

    event Listed(uint256 indexed tokenId, uint256 price, uint256 productId);
    event Purchased(address indexed buyer, uint256 indexed tokenId, uint256 productId, uint256 price);

    constructor(IERC20 yoda_, IERC721 skinNft_, address seller_) {
        require(address(yoda_) != address(0) && address(skinNft_) != address(0) && seller_ != address(0), "zero");
        yoda = yoda_;
        skinNft = skinNft_;
        seller = seller_;
    }

    function listItem(uint256 tokenId, uint256 price, uint256 productId) external {
        require(msg.sender == seller, "not seller");
        require(skinNft.ownerOf(tokenId) == seller, "not owner");
        require(price > 0, "price");
        listings[tokenId] = Listing({price: price, productId: productId, active: true});
        emit Listed(tokenId, price, productId);
    }

    function purchase(uint256 tokenId) external nonReentrant {
        Listing storage l = listings[tokenId];
        require(l.active, "not listed");
        uint256 price = l.price;
        uint256 pid = l.productId;
        l.active = false;

        require(yoda.transferFrom(msg.sender, seller, price), "yoda");
        skinNft.safeTransferFrom(seller, msg.sender, tokenId);

        emit Purchased(msg.sender, tokenId, pid, price);
    }
}
