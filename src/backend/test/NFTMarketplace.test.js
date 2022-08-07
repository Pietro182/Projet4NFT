const { expect } = require("chai"); 

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

/*
describe("NFTMarketplace", function () {

  let NFT;
  let nft;
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
    nft = await NFT.deploy();
    nftmarket = await NFTMarket.deploy();
  });
});
*/
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

describe("Purchasing marketplace items", function () {




  
  let price = 2
  let fee = (feePercent/100)*price
  let totalPriceInWei
  beforeEach(async function () {
    // addr1 mints an nft
    await nft.connect(addr1).mint(URI)
    // addr1 approves marketplace to spend tokens
    await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
    // addr1 makes their nft a marketplace item.
    await marketplace.connect(addr1).makeItem(nft.address, 1 , toWei(price))
  })
  it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
    const sellerInitalEthBal = await addr1.getBalance()
    const feeAccountInitialEthBal = await deployer.getBalance()
    // fetch items total price (market fees + item price)
    totalPriceInWei = await marketplace.getTotalPrice(1);
    // addr 2 purchases item.
    await expect(marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
    .to.emit(marketplace, "Bought")
      .withArgs(
        1,
        nft.address,
        1,
        toWei(price),
        addr1.address,
        addr2.address
      )
    const sellerFinalEthBal = await addr1.getBalance()
    const feeAccountFinalEthBal = await deployer.getBalance()
    // Item should be marked as sold
    expect((await marketplace.items(1)).sold).to.equal(true)
    // Seller should receive payment for the price of the NFT sold.
    expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
    // feeAccount should receive fee
    expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
    // The buyer should now own the nft
    expect(await nft.ownerOf(1)).to.equal(addr2.address);
  })
  it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
    // fails for invalid item ids
    await expect(
      marketplace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
    ).to.be.revertedWith("item doesn't exist");
    await expect(
      marketplace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
    ).to.be.revertedWith("item doesn't exist");
    // Fails when not enough ether is paid with the transaction. 
    // In this instance, fails when buyer only sends enough ether to cover the price of the nft
    // not the additional market fee.
    await expect(
      marketplace.connect(addr2).purchaseItem(1, {value: toWei(price)})
    ).to.be.revertedWith("not enough ether to cover item price and market fee"); 
    // addr2 purchases item 1
    await marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
    // addr3 tries purchasing item 1 after its been sold 
    const addr3 = addrs[0]
    await expect(
      marketplace.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
    ).to.be.revertedWith("item already sold");
  });
})


/*
    it("Should track each minted NFT", async function () {
      // addr1 mints an nft
      await nft.connect(addr1).createToken(URI)
      expect(await nft.createToken()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      // addr2 mints an nft
      await nft.connect(addr2).createToken(URI)
      expect(await nft.createToken()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  })
*/


  /*
  describe("Making marketplace items", function () {
    let price = 1
    let result 
    beforeEach(async function () {
      // addr1 mints an nft
      await nft.connect(addr1).mint(URI)
      // addr1 approves marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
    })


    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
      // addr1 offers their nft at a price of 1 ether
      await expect(marketplace.connect(addr1).makeItem(nft.address, 1 , toWei(price)))
        .to.emit(marketplace, "Offered")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address
        )
      // Owner of NFT should now be the marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // Item count should now equal 1
      expect(await marketplace.itemCount()).to.equal(1)
      // Get item from items mapping then check fields to ensure they are correct
      const item = await marketplace.items(1)
      expect(item.itemId).to.equal(1)
      expect(item.nft).to.equal(nft.address)
      expect(item.tokenId).to.equal(1)
      expect(item.price).to.equal(toWei(price))
      expect(item.sold).to.equal(false)
    });

    it("Should fail if price is set to zero", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

  });
  describe("Purchasing marketplace items", function () {
    let price = 2
    let fee = (feePercent/100)*price
    let totalPriceInWei
    beforeEach(async function () {
      // addr1 mints an nft
      await nft.connect(addr1).mint(URI)
      // addr1 approves marketplace to spend tokens
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
      // addr1 makes their nft a marketplace item.
      await marketplace.connect(addr1).makeItem(nft.address, 1 , toWei(price))
    })
    it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
      const sellerInitalEthBal = await addr1.getBalance()
      const feeAccountInitialEthBal = await deployer.getBalance()
      // fetch items total price (market fees + item price)
      totalPriceInWei = await marketplace.getTotalPrice(1);
      // addr 2 purchases item.
      await expect(marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
      .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        )
      const sellerFinalEthBal = await addr1.getBalance()
      const feeAccountFinalEthBal = await deployer.getBalance()
      // Item should be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true)
      // Seller should receive payment for the price of the NFT sold.
      expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
      // feeAccount should receive fee
      expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
      // The buyer should now own the nft
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
    })
    it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
      // fails for invalid item ids
      await expect(
        marketplace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
      ).to.be.revertedWith("item doesn't exist");
      await expect(
        marketplace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
      ).to.be.revertedWith("item doesn't exist");
      // Fails when not enough ether is paid with the transaction. 
      // In this instance, fails when buyer only sends enough ether to cover the price of the nft
      // not the additional market fee.
      await expect(
        marketplace.connect(addr2).purchaseItem(1, {value: toWei(price)})
      ).to.be.revertedWith("not enough ether to cover item price and market fee"); 
      // addr2 purchases item 1
      await marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
      // addr3 tries purchasing item 1 after its been sold 
      const addr3 = addrs[0]
      await expect(
        marketplace.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
      ).to.be.revertedWith("item already sold");
    });
  })
})
*/