import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("MarketSkinsModule contracts", async function () {
  const { ethers } = await network.connect({
    network: "hardhatMainnet",
    chainType: "l1",
  });

  it("deploys Yoda with 1M * 10^18 to recipient", async function () {
    const [, recipient] = await ethers.getSigners();
    const Yoda = await ethers.getContractFactory("YodaToken");
    const yoda = await Yoda.deploy(recipient.address);
    await yoda.waitForDeployment();
    const bal = await yoda.balanceOf(recipient.address);
    const expected = 1_000_000n * 10n ** 18n;
    assert.equal(bal, expected);
  });

  it("purchase moves YODA and NFT", async function () {
    const [seller, buyer] = await ethers.getSigners();
    const Yoda = await ethers.getContractFactory("YodaToken");
    const yoda = await Yoda.deploy(seller.address);
    await yoda.waitForDeployment();

    const Nft = await ethers.getContractFactory("MarketSkinsNFT");
    const nft = await Nft.deploy();
    await nft.waitForDeployment();

    const Market = await ethers.getContractFactory("SkinMarket");
    const market = await Market.deploy(await yoda.getAddress(), await nft.getAddress(), seller.address);
    await market.waitForDeployment();

    await (await nft.mintItem(seller.address, 4242n)).wait();
    await (await nft.connect(seller).setApprovalForAll(await market.getAddress(), true)).wait();
    const price = 50n * 10n ** 18n;
    await (await market.connect(seller).listItem(0n, price, 4242n)).wait();

    await (await yoda.connect(seller).transfer(buyer.address, price)).wait();
    await (await yoda.connect(buyer).approve(await market.getAddress(), price)).wait();
    await (await market.connect(buyer).purchase(0n)).wait();

    assert.equal(await nft.ownerOf(0n), buyer.address);
    assert.equal(await yoda.balanceOf(seller.address), 1_000_000n * 10n ** 18n);
  });
});
