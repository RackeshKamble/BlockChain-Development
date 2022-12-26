//Handle changes on ethers connections
export const provider = (state = {}, action) =>{
    switch(action.type) {
        case 'PROVIDER_LOADED' :
        return{
            ...state, // update existing state with CONNECTION
            connection : action.connection       
        }
        case 'NETWORK_LOADED' :
        return{
            ...state, // update existing state with NETWORK
            chainId : action.chainId       
        }
        case 'ACCOUNT_LOADED' :
        return{
            ...state, // update existing state with ACCOUNT
            account : action.account       
        }
        default:
            return state;
    }
}

export const tokens = (state = {loaded : false , contract : null}, action) =>{
    switch(action.type) {
        case 'TOKEN_LOADED' :
        return{
            ...state, // update existing state with CONNECTION
            loaded : true,
            contract : action.contract,
            symbol : action.symbol            
        }        
        default:
            return state;
    }
}









function counterReducer(state = { value: 0 }, action) {
    switch (action.type) {
      case 'counter/incremented':
        return { value: state.value + 1 }
      case 'counter/decremented':
        return { value: state.value - 1 }
      default:
        return state
    }
  }

