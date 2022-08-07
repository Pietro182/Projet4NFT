const { expect } = require("chai"); 

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)


  describe("Deployment", function () {

  let NFT;
  let nft1;
  let nft2;
  let NFTMarket;
  let nftmarket
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let listingPrice = 0.025;
  let URI = "sample URI"

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    NFT = await ethers.getContractFactory("NFT");
    NFTMarket = await ethers.getContractFactory("NFTMarket");
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contracts
    nft1 = await NFT.deploy("Collection1", "C1");
    console.log("nft1 contract address", nft1.address);
    nft2 = await NFT.deploy("Collection2", "C2");
    console.log("nft2 contract address", nft2.address);
    nftmarket = await NFTMarket.deploy();
  });

    it("Should track name and symbol of the nft collections", async function () {
      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const collection1Name = "Collection1"
      const collection1Symbol = "C1"
      expect(await nft1.name()).to.equal(collection1Name);
      expect(await nft1.symbol()).to.equal(collection1Symbol);

      const collection2Name = "Collection2"
      const collection2Symbol = "C2"
      expect(await nft2.name()).to.equal(collection2Name);
      expect(await nft2.symbol()).to.equal(collection2Symbol);
    });

    it("Should track owner and listingPrice of the marketplace", async function () {
      // expect(await nftmarket.owner()).to.equal(deployer.address);  // TypeError: nftmarket.owner is not a function
      expect(await nftmarket.getListingPrice()).to.equal(toWei(listingPrice));
    });
  });

  describe("Minting NFTs", function () {

  let NFT;
  let nft1;
  let nft2;
  let NFTMarket;
  let nftmarket
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let listingPrice = 0.025;
  let URI = "sample URI"
  //let nftAddress;

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    NFT = await ethers.getContractFactory("NFT");
    NFTMarket = await ethers.getContractFactory("NFTMarket");
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contracts
    nft1 = await NFT.deploy("Collection1", "C1");
    console.log("nft1 contract address", nft1.address);
    nft2 = await NFT.deploy("Collection2", "C2");
    console.log("nft2 contract address", nft2.address);
    nftmarket = await NFTMarket.deploy();
  });

  it("Should create market item", async function () {
      // addr1 mints an nft of collection1
      await nft1.connect(addr1).createToken(URI)
      expect(await nft1.newItemId()).to.equal(1);
      expect(await nft1.balanceOf(addr1.address)).to.equal(1);
      expect(await nft1.tokenURI(1)).to.equal(URI);
      // addr2 mints an nft of collection1
      await nft1.connect(addr2).createToken(URI)
      expect(await nft1.newItemId()).to.equal(2);
      expect(await nft1.balanceOf(addr2.address)).to.equal(1);
      expect(await nft1.tokenURI(2)).to.equal(URI);

      // addr1 mints an nft of collection2
      await nft2.connect(addr1).createToken(URI)
      expect(await nft2.newItemId()).to.equal(1);
      expect(await nft2.balanceOf(addr1.address)).to.equal(1);
      expect(await nft2.tokenURI(1)).to.equal(URI);
      // addr2 mints an nft of collection2
      await nft2.connect(addr2).createToken(URI)
      expect(await nft2.newItemId()).to.equal(2);
      expect(await nft2.balanceOf(addr2.address)).to.equal(1);
      expect(await nft2.tokenURI(2)).to.equal(URI);
  });

});

describe("Making marketplace items", function () {
  let price = 1;
  let NFT;
  let nft;
  let NFTMarket;
  let nftmarket
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let listingPrice;
  let URI = "sample URI"

  beforeEach(async function () {
 // Get the ContractFactories and Signers here.
 NFT = await ethers.getContractFactory("NFT");
 NFTMarket = await ethers.getContractFactory("NFTMarket");
 [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

 // To deploy our contracts
 nft = await NFT.deploy("Collection1", "C1");
 nftmarket = await NFTMarket.deploy();

    // addr1 mints an nft
    await nft.connect(addr1).createToken(URI)
    // addr1 approves marketplace to spend nft
    await nft.connect(addr1).setApprovalForAll(nftmarket.address, true)

  })

  it("Should track newly created item, transfer NFT from seller to marketplace and emit MarketItemCreated event", async function () {
    // addr1 offers their nft at a price of 1 ether

    listingPrice = await nftmarket.getListingPrice();
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    await expect(nftmarket.connect(addr1).createMarketItem(nft.address, 1, toWei(price), 1, {value: listingPrice}))
      .to.emit(nftmarket, "MarketItemCreated")
      .withArgs(
        1,
        nft.address,
        1,
        addr1.address,
        ZERO_ADDRESS,
        toWei(price),
        1
      )

    // Owner of NFT should now be the marketplace
    expect(await nft.ownerOf(1)).to.equal(nftmarket.address);
    // Item count should now equal 1
    expect(await nftmarket._itemIds()).to.equal(1)
    // Get item from items mapping then check fields to ensure they are correct
    const item = await nftmarket.idMarketItem(1)
    expect(item.itemId).to.equal(1)
    expect(item.nftContract).to.equal(nft.address)
    expect(item.tokenId).to.equal(1)
    expect(item.price).to.equal(toWei(price))
    expect(item.sold).to.equal(false)
    expect(item.collectionId).to.equal(1)
  });

  it("Should fail if price is set to zero", async function () {
    await expect(
      nftmarket.connect(addr1).createMarketItem(nft.address, 1, 0, 1, {value: listingPrice})
    ).to.be.revertedWith("Price must be above zero");
  });

});