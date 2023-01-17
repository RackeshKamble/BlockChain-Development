import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"
import config from '../config.json';
import { loadProvider,loadNetwork, loadAccount ,loadTokens, loadExchange, subscribeToEvents, loadAllOrders  } from "../store/interaction";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";
import OrderBook from "./OrderBook";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
      
    //Connect Ethers to Blockchain
    const provider = loadProvider(dispatch);
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider,dispatch);

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch current account & balance from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })
        
    // Load Token Smart Contract
    const rtbm = config[chainId].rtbm;
    const rEth = config[chainId].rEth;
    await loadTokens(provider, [rtbm.address , rEth.address] ,dispatch);
    
    // Load Exchange Smart Contract
    const exchangeconfig = config[chainId].exchange;
    const exchange = await loadExchange(provider,exchangeconfig.address, dispatch);
    
    // Fetch ALL ORDERS ( CANCELLED, FILLED, OPENED)
    loadAllOrders(provider, exchange, dispatch);
    
    // Listen to Events
    subscribeToEvents(exchange,dispatch);
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}
      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}
          <Markets />

          {/* Balance */}

          <Balance />

          {/* Order */}

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;