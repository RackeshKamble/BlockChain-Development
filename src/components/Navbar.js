import logo from '../assets/logo.png';
import eth from '../assets/eth.svg';
import { useDispatch, useSelector } from "react-redux";
import Blockies from "react-blockies";
import { loadAccount } from "../store/interactions";
import config from '../config.json';

const Navbar = () => {
    
    // useselector to fetch accounts, balance , provider and chainId
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const account = useSelector(state => state.provider.account);
    const balance = useSelector(state => state.provider.balance);
    const dispatch = useDispatch();

    const connectHandler = async () => {
        //load account here
        const account = await loadAccount(provider, dispatch);
    }
    const networkHandler = async (event) =>{
        console.log(event.target.value);
        //Switches Network Kovan <-> localhost 
        await window.ethereum.request({
            method : 'wallet_switchEthereumChain' ,
            params : [{chainId : event.target.value}]
        })
    }
    return(
      
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={logo} className="logo" alt="RDex Logo"></img>
            <h1>R-Dex Token Exchange</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth} alt="ETH Logo" className='Eth Logo' />
            
            {/* Check if chainId is present */}
            {chainId && (

            <select name="networks" id="networks" value={config[chainId] ? '0x${chainId.toString(16)}' : '0'} onChange={networkHandler}>
                <option value="0" disabled>Select Network</option>
                <option value="0x7A69">Localhost</option>
                <option value="0x5">Goerli</option>
                <option value="0x13881">Mumbai</option>
            </select>
            
            )}
        </div>
  
        <div className='exchange__header--account flex'>
            {/* slice method used to show first 5 and last 4 chars in account & show 4 chars in balance similar to metamask */}
            {/* Ternary Operator used to check account and balance*/}

            {balance ? (<p><small>My Balance</small> {Number(balance).toFixed(4)} </p>)  : (<p><small>My Balance</small> 0 ETH </p>)}
            {account ? ( <a href={config[chainId] ? 
                `${config[chainId].explorerURL}/address/${account}` : `#`}
                target='_blank'
                rel='noreferrer'
          >
            {/* react-blockies used for account picture */}
            {account.slice(0,5) +"..."+ account.slice(38,42) } 
                <Blockies 
                seed={account} size={10} scale={3} color="#2187D0" bgColor="#F1F2F9" spotColor="#767F92" className="identicon" 
                />     
            </a> ) : ( <button className="button" onClick={connectHandler}>Connect</button> ) }            
            
        </div>
      </div>
    )
  }
  
  export default Navbar;
  