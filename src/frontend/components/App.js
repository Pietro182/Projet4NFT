import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
//import logo from './logo.png';
import Navigation from './Navbar';
import Home from './Home.js'
import CreateNFT from './CreateNft.js'
import MyListedItems from './MyListedItems.js'
import CreateCollection from './CreateCollection.js'
import MyPurchases from './MyPurchases.js'

import NFTMarketAbi from '../contractsData/NFTMarket.json'
import NFTMarketAddress from '../contractsData/NFTMarket-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
  /*
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
  */
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(NFTMarketAddress.address, NFTMarketAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }


  return (
    <BrowserRouter>
    <div>
     <Navigation web3Handler={web3Handler} account={account} />

     <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />
              <Route path="/create"  />
              <Route path="/my-listed-items" />
              <Route path="/my-purchases" />
            </Routes>
          )}
          </div>
        </div>
      </BrowserRouter>
  
    );
  }

export default App;
