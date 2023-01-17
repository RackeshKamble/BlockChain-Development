import { createSelector } from 'reselect'
//import { tokens } from "./reducers"; // We are using Loadash for this
import { get, groupBy, maxBy, minBy, reject } from 'lodash';
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


// ------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) =>{
    if (!tokens[0] || !tokens[1]) 
    { return }
    
    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);

    // Sort orders by time ascending for price comparison
      // a-b -> ascending order
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)
    
    // Apply colors / Decorate the orders
    orders = decorateFilledOrders(orders ,tokens);

    // Sort orders by date descending for display
      // b-a -> descending order
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)


    return orders;
  }
)

// Apply colors
const decorateFilledOrders = (orders, tokens) => {
  
  // Track previous order to compare history and change colors accordingly
  let previousOrder = orders[0];

  return(
    orders.map((order)=>{
      // decorate each individual order
      order = decorateOrder(order , tokens);
      order = decorateFilledOrder(order, previousOrder);
      
      // Update the previous order once it's decorated
      previousOrder = order;
      return order;
    })
  )
}


const decorateFilledOrder = (order, previousOrder) => {
  
  return({
    ...order,
    tokenPriceClass : tokenPriceClass(order.tokenPrice , order.id , previousOrder)
  })
}

// Determine GREEN for higher order and RED for lower price order
const tokenPriceClass = (tokenPrice , orderId , previousOrder) =>{
  
  // Show green price IF ONLY ONE ORDER EXIST
    if (previousOrder.id === orderId) {
      return GREEN
    }

  // Show GREEN price if order price HIGHER than previous order
  // Show RED price if order price LOWER than previous order  
  if (previousOrder.tokenPrice <= tokenPrice) {
    // success
      return GREEN 
  } else {
    // danger
      return RED 
  }
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

// ------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) 
    { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);
    console.log(orders);

    // Sort orders by date ascending to compare history
    orders = orders.sort((a,b) => a.timestamp - b.timestamp);

    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o, tokens));

    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);

    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0);

    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0);

    return ({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })
    
  }
  )
  const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  // Moment used for timestamp
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format());

  // Get each hour where data exists
  const hours = Object.keys(orders);

  // Build the graph series
  const graphData = hours.map((hour) => {

  // Fetch all orders from current hour
  const group = orders[hour];

    // Calculate price values: open, high, low, close
      // first order
      const open = group[0];
      // high price -> maxBy available in Lodash
      const high = maxBy(group, 'tokenPrice');
      // low price -> minBy available in Lodash
      const low = minBy(group, 'tokenPrice') 
      // last order
      const close = group[group.length - 1] 

  return({
    x: new Date(hour),
    y: [open.tokenPrice , high.tokenPrice , low.tokenPrice , close.tokenPrice]
  })
  })


  return graphData;
  }
  