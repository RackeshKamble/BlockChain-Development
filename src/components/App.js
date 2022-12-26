import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"
import config from '../config.json';
import { loadProvider,loadNetwork, loadAccount ,loadTokens, loadExchange } from "../store/interaction";


function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
      
    //Connect Ethers to Blockchain
    const provider = await loadProvider(dispatch);
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider,dispatch);

    // Fetch current account & balance from Metamask
    const account = await loadAccount(provider, dispatch);
        
    // Load Token Smart Contract
    const rtbm = config[chainId].rtbm;
    const rEth = config[chainId].rEth;
    const token = await loadTokens(provider, [rtbm.address , rEth.address] ,dispatch);
    
    // Load Exchange Smart Contract
    const exchangeconfig = config[chainId].exchange;
    const exchange = await loadExchange(provider,exchangeconfig.address, dispatch);
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;