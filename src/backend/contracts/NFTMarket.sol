//SPDX-License-Identifier: MIT
pragma solidity  0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
 //prevents re-entrancy attacks
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
 
interface INFT {
    function collectionName() external view returns (string memory);
}

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public _itemIds; //total number of items ever created
    Counters.Counter public _itemsSold; //total number of items sold
    Counters.Counter public _collectionIds; //total number of collections created
    address payable owner; //owner of the smart contract
    INFT public nft;
    string myCollectionName;

    function getMyCollectionName(address _nftContract) public returns (string memory){
        nft = INFT(_nftContract);
        myCollectionName = nft.collectionName();
        return myCollectionName;
    }

    //people have to pay to buy their NFT on this marketplace
    uint256 public listingPrice = 0.025 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        IERC721 nftContract;
        uint256 tokenId;
        address payable seller; //person selling the nft
        address payable owner; //owner of the nft
        uint256 price;
        bool sold;
        uint collectionId;
    }

    struct Collection {
        uint collectionId;
        string name;
        string description;
    }

    //a way to access values of the MarketItem struct above by passing an integer ID
    mapping(uint256 => MarketItem) public idMarketItem;
 
    mapping(uint256 => Collection ) public idCollection;

    //log message (when Item is created)
    event MarketItemCreated (
        uint indexed itemId,
        IERC721 indexed nftContract,
        uint256 indexed tokenId,
        address  seller,
        address  owner,
        uint256 price,
        uint collectionId
    ); 

    // Anis
    event ProductSold(
        uint256 indexed itemId,
        IERC721 indexed nftContract,
        uint256 tokenId,
        address seller,
        address indexed owner,
        uint256 price,
        bool sold
    );

    /// @notice function to get listingprice
    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    function setListingPrice(uint _price) public returns(uint) {
         if(msg.sender == address(this) ){
             listingPrice = _price;
         }
         return listingPrice;
    }

    /// @notice function to create market item
    function createMarketItem(
        IERC721 nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 collectionId
        ) public payable nonReentrant{
         require(price > 0, "Price must be above zero");

         _itemIds.increment(); //add 1 to the total number of items ever created
         uint256 itemId = _itemIds.current();

         idMarketItem[itemId] = MarketItem(
             itemId,
             nftContract,
             tokenId,
             payable(msg.sender), //address of the seller putting the nft up for sale
             payable(address(0)), //no owner yet (set owner to empty address)
             price,
             false,
             collectionId
         );

            //transfer ownership of the nft to the contract itself
            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

            //log this transaction
            emit MarketItemCreated(
            itemId,
             nftContract,
             tokenId,
             msg.sender,
             address(0),
             price,
             collectionId
            );
        }

    function addCollectionToMapping(address _nftContract, string memory _description ) public {
         _collectionIds.increment(); //add 1 to the total number of collection ever created
         uint collectionId = _collectionIds.current();

           string memory collectionName =  getMyCollectionName(_nftContract);

            idCollection[collectionId] = Collection(
             collectionId,
             collectionName,
             _description
            );
    }

        function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        MarketItem storage item = idMarketItem[_itemId];
        //require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        owner.transfer(_totalPrice - item.price);
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        item.nftContract.transferFrom(address(this), msg.sender, item.tokenId);
        // emit ProductSold event
       emit ProductSold(
           item.itemId,
            item.nftContract,
            item.tokenId,
            item.seller,
            payable(msg.sender),
            item.price,
            item.sold
            );
    }

        /// @notice total number of items unsold on our platform
        function fetchMarketItems() public view returns (MarketItem[] memory){
            uint itemCount = _itemIds.current(); //total number of items ever created
            //total number of items that are unsold = total items ever created - total items ever sold
            uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
            uint currentIndex = 0;

            MarketItem[] memory items =  new MarketItem[](unsoldItemCount);

            //loop through all items ever created
            for(uint i = 0; i < itemCount; i++){

                //get only unsold item
                //check if the item has not been sold
                //by checking if the owner field is empty
                if(idMarketItem[i+1].owner == address(0)){
                    //yes, this item has never been sold
                    uint currentId = idMarketItem[i + 1].itemId;
                    MarketItem storage currentItem = idMarketItem[currentId];
                    items[currentIndex] = currentItem;
                    currentIndex += 1;

                }
            }
            return items; //return array of all unsold items
        }

   function fetchSingleItem(uint256 id)
        public
        view
        returns (MarketItem memory)
    {
        return idMarketItem[id];
    }

        /// @notice fetch list of NFTS owned/bought by this user
        function fetchMyNFTs() public view returns (MarketItem[] memory){
            //get total number of items ever created
            uint totalItemCount = _itemIds.current();

            uint itemCount = 0;
            uint currentIndex = 0;

            for(uint i = 0; i < totalItemCount; i++){
                //get only the items that this user has bought/is the owner
                if(idMarketItem[i+1].owner == msg.sender){
                    itemCount += 1; //total length
                }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount; i++){
               if(idMarketItem[i+1].owner == msg.sender){
                   uint currentId = idMarketItem[i+1].itemId;
                   MarketItem storage currentItem = idMarketItem[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
            }
            return items;

        }


         /// @notice fetch list of NFTS owned/bought by this user
        function fetchItemsCreated() public view returns (MarketItem[] memory){
            //get total number of items ever created
            uint totalItemCount = _itemIds.current();

            uint itemCount = 0;
            uint currentIndex = 0;


            for(uint i = 0; i < totalItemCount; i++){
                //get only the items that this user has bought/is the owner
                if(idMarketItem[i+1].seller == msg.sender){
                    itemCount += 1; //total length
                }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount; i++){
               if(idMarketItem[i+1].seller == msg.sender){
                   uint currentId = idMarketItem[i+1].itemId;
                   MarketItem storage currentItem = idMarketItem[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
            }
            return items;

        }

        function getTotalPrice(uint _itemId) view public returns(uint){
        return(idMarketItem[_itemId].price+listingPrice);
        }
/*
        function fetchArtistsCreations(address _artist) public view returns (MarketItem[] memory){
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idMarketItem[i + 1].artist == _artist && !idMarketItem[i + 1].sold) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idMarketItem[i + 1].artist == _artist && !idMarketItem[i + 1].sold) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
*/
}