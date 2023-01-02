import rtbm from '../assets/dapp.svg'
import { useEffect , useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadBalances, transferTokens } from '../store/interaction';
//import { exchange, tokens } from '../store/reducers';

const Balance = () => {
    //Hooks used
    const [token1TrasnferAmount ,setToken1TrasnferAmount] = useState(0);

    const dispatch = useDispatch();
    
    const provider = useSelector(state => state.provider.connection);
    
    const account = useSelector(state => state.provider.account);
    const exchange = useSelector(state => state.exchange.contracts);
    const exchangeBalances = useSelector(state => state.exchange.balances);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);
    const tokens = useSelector(state => state.tokens.contracts);
    const symbols = useSelector(state => state.tokens.symbols);
    const tokenBalances = useSelector(state => state.tokens.balances);
    
    //Update Balance Amount handler from textbox
    const amountHandler = (event ,token) =>{
        if(token.address === tokens[0].address){
            setToken1TrasnferAmount(event.target.value);
        }
    }

    // 1 - Make Transfer => depositHandler event
    // 2 - Notify App that Transfer are pending => check TRANSFER_REQUEST in reducer
    // 3 - Get confirmation from blockchain that Transfer was success => check TRANSFER_SUCCESS in reducer
    // 4 - Notify App that Transfer is success => check subscribeToEvents in interactions
    // 5 - Handler FAILED Transfer and NOTIFY App => check TRANSFER_FAIL in reducer
    
    // 1 - Make Transfer
    const depositHandler = (event ,token) =>{
        event.preventDefault(); // Prevents default refresh on enter
        if(token.address === tokens[0].address){
          //Transfer tokens to meta
          transferTokens(provider, exchange, 'Deposit', token, token1TrasnferAmount, dispatch);
          setToken1TrasnferAmount(0);
        }
        console.log({token1TrasnferAmount});
    }
    
    useEffect(() => {
        if(exchange && tokens[0] && tokens[1] && account) {
          loadBalances(exchange, tokens, account, dispatch)
        }
      }, [exchange, tokens, account, transferInProgress])

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (rtbm) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small> <br/> <img src={rtbm} alt="Token Logo" /> {symbols && symbols[0]}</p>     
            <p><small>Wallet</small> <br />{tokenBalances && tokenBalances[0]}</p>  
            <p><small>Exchange</small> <br />{exchangeBalances && exchangeBalances[0]}</p>  
                 
          </div>
  
          <form onSubmit={(event) => depositHandler(event , tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount </label>
            <input 
                type="text" 
                id='token0' 
                placeholder='0.0000' 
                value={token1TrasnferAmount === 0 ? '' : token1TrasnferAmount} 
                onChange={(event) => amountHandler(event, tokens[0])} />
  
            <button className='button' type='submit'>
              <span>Deposit</span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (rEth) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
  
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;