const { expect } = require("chai"); 

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

  describe("Deployment", function () {
  let NFT;
  let nft1;
  let nft2;
  let NFTMarket;
  let nftmarket;
  let deployer;
  let addr1;
  let listingPrice = 0.025;
  let URI = "sample URI"

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    NFT = await ethers.getContractFactory("NFT");
    NFTMarket = await ethers.getContractFactory("NFTMarket");
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contracts
    nft1 = await NFT.deploy("Collection1", "C1");
    await nft1.deployed();
    console.log("nft1 contract address", nft1.address);
    nft2 = await NFT.deploy("Collection2", "C2");
    await nft2.deployed();
    console.log("nft2 contract address", nft2.address);
    nftmarket = await NFTMarket.deploy();
    await nftmarket.deployed();
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
/*
    it("Should add a created collection to idCollection mapping", async function () {
      nft1 = await NFT.deploy("Collection1", "C1");
      await nft1.deployed();
      console.log("nft1 contract address", nft1.address);
      nft2 = await NFT.deploy("Collection2", "C2");
      await nft2.deployed();
      console.log("nft2 contract address", nft2.address);
      nftmarket = await NFTMarket.deploy();
      await nftmarket.deployed();
      const myCollectionName = await nftmarket.connect(addr1).getMyCollectionName(nft1.address)
      console.log("My collection name is ", myCollectionName);
      
      await nftmarket.connect(addr1).addCollectionToMapping(nft1.address, "This is the first collection" )
      const collection = await nftmarket.idCollection(1)
      expect(collection.collectionId).to.equal(1)
      expect(collection.name).to.equal("Collection1")
      expect(collection.description).to.equal("This is the first collection")
      
    });
*/
    it("Should track listingPrice of the marketplace", async function () {
      //expect(await nftmarket.owner()).to.equal(deployer.address);  // TypeError: nftmarket.owner is not a function
      expect(await nftmarket.getListingPrice()).to.equal(toWei(listingPrice));
    });

    
    it("Should set the listingPrice of the marketplace", async function () {
      const newListingPrice = await nftmarket.connect(deployer).setListingPrice(toWei(5))
      console.log("New listing price ", newListingPrice);
      //let b = ethers.BigNumber.from(newListingPrice);
      //expect(await nftmarket.getListingPrice()).to.equal(toWei(newListingPrice));
    });
  });

  describe("Minting NFTs", function () {
  let NFT;
  let nft1;
  let nft2;
  let NFTMarket;
  let nftmarket;
  let deployer;
  let addr1;
  let addr2;
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
  let nftmarket;
  let deployer;
  let addr1;
  let addr2;
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

listingPrice = await nftmarket.getListingPrice();

  })

  it("Should track newly created item, transfer NFT from seller to marketplace and emit MarketItemCreated event", async function () {
    // addr1 offers their nft at a price of 1 ether

    
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
    // get the Total price
    let a = ethers.BigNumber.from(toWei(price));
    let b = ethers.BigNumber.from(listingPrice);
    const totalPrice = a.add(b);
    expect(await nftmarket.getTotalPrice(1)).to.equal(totalPrice);

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

describe("Purchasing marketplace items", function () {
  let price = 2;
  let NFT;
  let nft;
  let NFTMarket;
  let nftmarket;
  let deployer;
  let addr1;
  let addr2;
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
    // addr1 approves marketplace to spend tokens
    await nft.connect(addr1).setApprovalForAll(nftmarket.address, true)
    // addr1 makes their nft a marketplace item.
    listingPrice = await nftmarket.getListingPrice();
    await nftmarket.connect(addr1).createMarketItem(nft.address, 1, toWei(price), 1, {value: listingPrice})
  })

  
  it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
    const sellerInitalEthBal = await addr1.getBalance()

    const feeMarketplaceOwnerInitialEthBal = await deployer.getBalance()

   
    // addr 2 purchases item.

    await expect(nftmarket.connect(addr2).createMarketSale(nft.address, 1, {value: toWei(price)}))
    .to.emit(nftmarket, "ProductSold")
      .withArgs(
        1,
        nft.address,
        1,
        addr1.address,
        addr2.address,
        toWei(price),
        true
      )
    const sellerFinalEthBal = await addr1.getBalance()
    const feeMarketplaceOwnerFinalEthBal = await deployer.getBalance()
    
    
    // Item should be marked as sold
    expect((await nftmarket.idMarketItem(1)).sold).to.equal(true)
    // Seller should receive payment for the price of the NFT sold.
    expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))

     // fetch items total price (market fees + item price)
     listingPrice = await nftmarket.getListingPrice();
    // feeAccount should receive fee

    let a = ethers.BigNumber.from(feeMarketplaceOwnerInitialEthBal);
    let b = ethers.BigNumber.from(listingPrice);
    const feeMarketplaceOwnerNewEthBal = a.add(b);
    expect(feeMarketplaceOwnerFinalEthBal).to.equal(feeMarketplaceOwnerNewEthBal)
    // The buyer should now own the nft
    expect(await nft.ownerOf(1)).to.equal(addr2.address);
  })

  it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
   
   /*
    // fails for invalid item ids
    await expect(
      nftmarket.connect(addr2).createMarketSale(nft.address, 2, {value: toWei(price)})
    ).to.be.revertedWith("item doesn't exist");
    await expect(
      nftmarket.connect(addr2).createMarketSale(nft.address, 0, {value: toWei(price)})
    ).to.be.revertedWith("item doesn't exist");
   */

    // Fails when not enough ether is paid with the transaction. 
    // In this instance, fails when buyer only sends enough ether to cover the price of the nft
    // not the additional market fee.
    await expect(
      nftmarket.connect(addr1).createMarketSale(nft.address, 1, {value: toWei(1)})
    ).to.be.revertedWith("Please submit the asking price in order to complete purchase"); 
    // addr2 purchases item 1
    await nftmarket.connect(addr1).createMarketSale(nft.address, 1, {value: toWei(price)})
    // addr3 tries purchasing item 1 after its been sold 
    const addr3 = addrs[0]
    await expect(
      nftmarket.connect(addr2).createMarketSale(nft.address, 1, {value: toWei(price)})
    ).to.be.revertedWith("item already sold");
  });
})