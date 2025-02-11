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
  const BASE_IPFS_ID =
    "bafybeidiuvahdt7mh4rte4r7o7557b4bkryrtnisrzh5utvustocmndb2e";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const testNftFactory = await ethers.getContractFactory("TestNft");

    testNft = await testNftFactory.deploy(
      await owner.getAddress(),
      BASE_IPFS_ID
    );

    await testNft.waitForDeployment();
  });

  it("should deploy", async () => {
    expect(await testNft.owner()).to.equal(await owner.getAddress());
  });

  it("should mint an NFT successfully", async function () {
    const tx = await testNft
      .connect(addr1)
      .mintNFT(await addr1.getAddress(), { value: MINT_PRICE });
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }

    const event = receipt.logs
      .map((log) => testNft.interface.parseLog(log))
      .find((parsedLog) => parsedLog && parsedLog.name === "NFTMinted");

    expect(event).to.not.be.undefined;
    expect(event?.args?.owner).to.equal(await addr1.getAddress());
    expect(event?.args?.tokenId).to.equal(0);
    expect(event?.args?.tokenURI).to.equal(`ipfs://${BASE_IPFS_ID}/0.json`);

    const tokenId = 0;
    expect(event?.args?.tokenURI).to.equal(
      `ipfs://${BASE_IPFS_ID}/${tokenId}.json`
    );
    const uri = await testNft.tokenURI(tokenId);
    expect(uri).to.equal(`ipfs://${BASE_IPFS_ID}/${tokenId}.json`);
  });

  it("should fail if insufficient funds are sent", async function () {
    await expect(
      testNft.connect(addr2).mintNFT(await addr2.getAddress(), {
        value: ethers.parseEther("0.005"),
      })
    ).to.be.revertedWith("Insufficient funds");
  });

  it("should return the correct total supply", async function () {
    await testNft.connect(addr1).mintNFT(await addr1.getAddress(), {
      value: MINT_PRICE,
    });
    await testNft.connect(addr2).mintNFT(await addr2.getAddress(), {
      value: MINT_PRICE,
    });

    expect(await testNft.totalSupply()).to.equal(2);
  });

  it("should not allow minting more than MAX_SUPPLY", async function () {
    for (let i = 0; i < 100; i++) {
      await testNft.connect(addr1).mintNFT(await addr1.getAddress(), {
        value: MINT_PRICE,
      });
    }

    await expect(
      testNft.connect(addr2).mintNFT(await addr2.getAddress(), {
        value: MINT_PRICE,
      })
    ).to.be.revertedWith("Maximum supply reached");
  });

  it("should allow the owner to withdraw funds", async function () {
    const initialBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );
    await testNft.connect(addr1).mintNFT(await addr1.getAddress(), {
      value: MINT_PRICE,
    });

    const tx = await testNft.connect(owner).withdraw();
    await tx.wait();

    const finalBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );
    expect(finalBalance).to.be.gt(initialBalance);
  });
});
