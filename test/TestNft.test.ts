import { TestNft } from "../typechain-types";
import { ethers as e } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("TestNft", () => {
  let testNft: TestNft;
  let owner: e.Signer;
  let addr1: e.Signer;
  let addr2: e.Signer;

  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const testNftFactory = await ethers.getContractFactory("TestNft");

    testNft = await testNftFactory.deploy(await owner.getAddress());

    await testNft.waitForDeployment();
  });

  it("should deploy", async () => {
    expect(await testNft.owner()).to.equal(await owner.getAddress());
  });

  it("should mint an NFT successfully", async function () {
    const tokenURI =
      "ipfs://bafybeibm3vfjnzzb4a4j4yu5phi4rez45dpyauakr4iwnm4rwaudhuyayi";

    const tx = await testNft
      .connect(addr1)
      .mintNFT(await addr1.getAddress(), tokenURI, { value: MINT_PRICE });
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }

    const event = receipt.logs
      .map((log) => testNft.interface.parseLog(log))
      .find((parsedLog) => parsedLog && parsedLog.name === "NFTMinted");

    expect(event).to.not.be.undefined;
    expect(event?.args?.owner).to.equal(await addr1.getAddress());
    expect(event?.args?.tokenId).to.equal(1);
    expect(event?.args?.tokenURI).to.equal(tokenURI);

    const tokenId = 1;
    const uri = await testNft.tokenURI(tokenId);
    expect(uri).to.equal(tokenURI);
  });

  it("should fail if insufficient funds are sent", async function () {
    const tokenURI = "https://example.com/metadata/2";
    await expect(
      testNft.connect(addr2).mintNFT(await addr2.getAddress(), tokenURI, {
        value: ethers.parseEther("0.005"),
      })
    ).to.be.revertedWith("Insufficient funds");
  });

  it("should return the correct total supply", async function () {
    await testNft
      .connect(addr1)
      .mintNFT(await addr1.getAddress(), "https://example.com/metadata/3", {
        value: MINT_PRICE,
      });
    await testNft
      .connect(addr2)
      .mintNFT(await addr2.getAddress(), "https://example.com/metadata/4", {
        value: MINT_PRICE,
      });

    expect(await testNft.totalSupply()).to.equal(2);
  });

  it("should not allow minting more than MAX_SUPPLY", async function () {
    for (let i = 0; i < 100; i++) {
      await testNft
        .connect(addr1)
        .mintNFT(
          await addr1.getAddress(),
          `https://example.com/metadata/${i + 1}`,
          {
            value: MINT_PRICE,
          }
        );
    }

    await expect(
      testNft
        .connect(addr2)
        .mintNFT(await addr2.getAddress(), "https://example.com/metadata/101", {
          value: MINT_PRICE,
        })
    ).to.be.revertedWith("Maximum supply reached");
  });
});
