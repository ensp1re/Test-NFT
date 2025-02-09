import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TestNft = await ethers.getContractFactory("TestNft");
  const testNft = await TestNft.deploy(deployer.address);

  await testNft.waitForDeployment();
  console.log("TestNft deployed to:", await testNft.getAddress());

  const tokenURI =
    "https://gold-peculiar-unicorn-299.mypinata.cloud/ipfs/bafybeibm3vfjnzzb4a4j4yu5phi4rez45dpyauakr4iwnm4rwaudhuyayi";
  const mintPrice = ethers.parseEther("0.01");

  console.log("Minting NFT...");
  const tx = await testNft
    .connect(deployer)
    .mintNFT(deployer.address, tokenURI, { value: mintPrice });
  await tx.wait();

  console.log("NFT minted with token URI:", tokenURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
