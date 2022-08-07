async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get the ContractFactories and Signers here.
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy("Onsenfou", "OSF");
  await nft.deployed();
  
  // deploy contracts
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftmarket = await NFTMarket.deploy();
  await nftmarket.deployed();

  console.log("NFT contract address", nft.address);
  console.log("Marketplace contract address", nftmarket.address);
  
  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(nft , "NFT");
  saveFrontendFiles(nftmarket , "NFTMarket");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
