import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TestNft = await ethers.getContractFactory("TestNft");

  const CID = "bafybeibjwbrdo3ued7rygvxzu6f3jktzwcmngavd45ibc7dbaa6bhxvsme";

  const testNft = await TestNft.deploy(deployer.address, CID);

  await testNft.waitForDeployment();
  console.log("TestNft deployed to:", await testNft.getAddress());

  const mintPrice = ethers.parseEther("0.01");

  console.log("Minting NFT...");
  const tx = await testNft
    .connect(deployer)
    .mintNFT(deployer.address, { value: mintPrice });
  await tx.wait();

  console.log("NFT minted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
