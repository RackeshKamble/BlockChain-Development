import { createSelector } from 'reselect'
//import { tokens } from "./reducers"; // We are using Loadash for this
import { get, groupBy, reject } from 'lodash';
//moment = to Format time which is in HEX -> Human Readable
import moment from 'moment';
import { ethers } from 'ethers';

const GREEN = '#25CE8F' ;
const RED = '#F45353' ;

const tokens = state => get(state, 'tokens.contracts');
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])


const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)
  
    const openOrders = reject(all, (order) => {
      const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
      const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
      return(orderFilled || orderCancelled)
    })
  
    return openOrders
  
  }
  
//Decorate Orders
const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    //RTBM is token0 and rEth is token1

    if (order.tokenGive === tokens[1].address) {
        //RTBM we are giving
        token0Amount = order.amountGive;
        //rEth we want
        token1Amount = order.amountGet;
    }
    else {
        //RTBM we want
        token0Amount = order.amountGet;
        //rEth we are giving
        token1Amount = order.amountGive;
    }

    // Calculate token price to 5 decimal places
    const precision = 100000;
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

//ORDER BOOK
export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
      if (!tokens[0] || !tokens[1]) { return }
  
      // Filter orders by selected tokens
      orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
      orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
  
      // Decorate orders
      orders = decorateOrderBookOrders(orders, tokens)
  
      // Group orders by "orderType"
      orders = groupBy(orders, 'orderType')
  
      // Fetch buy orders
      const buyOrders = get(orders, 'buy', [])

   // Sort buy orders by token price HIGH <--> LOW
   orders = {
    ...orders,
    buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

   // Fetch sell orders
   const sellOrders = get(orders, 'sell', [])

    // Sort sell orders by token price HIGH <--> LOW
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
      }
  
      return orders
    }
  )

  const decorateOrderBookOrders = (orders, tokens) => {
    return(
      orders.map((order) => {
        order = decorateOrder(order, tokens)
        order = decorateOrderBookOrder(order, tokens)
        return(order)
      })
    )
  }

const decorateOrderBookOrder = (order, tokens) => {
    //Determine Buy OR Sell Order and setup colors
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })
}