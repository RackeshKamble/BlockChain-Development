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
        case 'ETHER_BALANCE_LOADED' :
        return{
            ...state, // update existing state with ACCOUNT
            balance : action.balance       
        }
        default:
            return state;
    }
}
const DEFAULT_TOKENS_STATE = {
    loaded : false , 
    contracts : [] , 
    symbols :[] 
};

export const tokens = (state = DEFAULT_TOKENS_STATE, action) =>{
    switch(action.type) {
        case 'TOKEN_1_LOADED' :
        return{
            ...state, // update existing state with CONNECTION
            loaded : true,
            contracts : [... state.contracts , action.token],
            symbols : [...state.symbols , action.symbols]            
        }
        
        case 'TOKEN_2_LOADED' :
        return{
            ...state, // update existing state with CONNECTION
            loaded : true,
            contracts : [... state.contracts , action.token],
            symbols : [...state.symbols , action.symbols]            
        }

        default:
            return state;
    }
}

export const exchange = (state = { loaded : false , contract :{} }, action) =>{
    switch(action.type) {
        case 'EXCHANGE_LOADED' :
        return{
            ...state, // update existing state with CONNECTION
            loaded : true,
            contracts : action.exchange,            
        }
        default:
            return state;
    }
}




