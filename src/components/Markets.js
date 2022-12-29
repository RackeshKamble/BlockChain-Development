import config from '../config.json';
import { useDispatch, useSelector } from "react-redux";
import { loadTokens } from "../store/interaction";

const Markets = () => {
    // useselector to fetch accounts, balance , provider and chainId
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    
    const dispatch = useDispatch();

    const marketHandler = async (event) => {
        loadTokens(provider, (event.target.value).split(',') , dispatch)
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>
        
        {chainId && config[chainId] ? (
            <select name="markets" id="markets" onChange={marketHandler}>
            <option value={`${config[chainId].rtbm.address},${config[chainId].rEth.address}`}>rtbm / rEth</option>
            <option value={`${config[chainId].rtbm.address},${config[chainId].rDai.address}`}>rtbm / rDai</option>
            </select>
            ) : (
                <div>
                    <p>Not Deployed to Network</p>
                </div>
            )}

        <hr />
      </div>
    )
  }
  
  export default Markets;