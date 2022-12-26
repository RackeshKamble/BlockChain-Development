import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json"
import config from '../config.json';
import { loadProvider,loadNetwork, loadAccount ,loadToken } from "../store/interaction";


function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const account = await loadAccount(dispatch);
    
    //Connect Ethers to Blockchain
    const provider = await loadProvider(dispatch);
    const chainId = await loadNetwork(provider,dispatch);
        
    // Token Smart Contract
    const token = await loadToken(provider, config[chainId].rtbm.address ,dispatch)
        
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