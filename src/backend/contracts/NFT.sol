//SPDX-License-Identifier: MIT
pragma solidity  0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NFT is ERC721URIStorage {

    //auto-increment field for each token
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint public newItemId;

    constructor(string memory _collectionName, string memory _collectionSymbol) ERC721(_collectionName, _collectionSymbol){
        console.log("A Collection w/ name %s has been created linked to the contracte %s", _collectionName, address(this));
        emit CollectionCreated(_collectionName, _collectionSymbol);
    }

    event CollectionCreated(string indexed collectionName, string collectionSymbol);
    
    /// @notice create a new token
    /// @param tokenURI : token URI
    function createToken(string memory tokenURI) public returns(uint) {
        //set a new token id for the token to be minted
        _tokenIds.increment();
        newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId); //mint the token
        _setTokenURI(newItemId, tokenURI); //generate the URI
        
         console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
        //return token ID
        return (newItemId);
    }
}