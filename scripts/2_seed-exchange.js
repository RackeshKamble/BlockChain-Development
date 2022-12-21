const config = require('../src/config.json');

const { ethers } = require("hardhat");
require("@nomiclabs/hardhat-etherscan");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}
//Wait 1 second, check below
const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve,milliseconds));
}

async function main() {

    //Fetch Accounts from wallet
    const accounts = await ethers.getSigners();

    //Fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log("Using chainId:", chainId)

    const rtbm = await ethers.getContractAt("Token", config[chainId].rtbm.address);
    console.log("RTBM Token Fetched " + rtbm.address+"\n");

    const rEth = await ethers.getContractAt("Token", config[chainId].rEth.address);
    console.log("REth Token Fetched " + rEth.address+"\n");

    const rDai = await ethers.getContractAt("Token", config[chainId].rDai.address);
    console.log("RDai Token Fetched " + rDai.address+"\n");

    const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);
    console.log("Exchange Fetched " + exchange.address+"\n");

    let transaction,result,amount,orderId;
    
    //Give tokens to account[1]
    const sender = accounts[0];
    const receiver = accounts[1];
    amount = tokens(10000);

    //User 1 transfers 10k rEth
    
    transaction = await rEth.connect(sender).transfer(receiver.address, amount);
    console.log("Transfered  " + amount + "  tokens from "+sender.address+"  to "+receiver.address+"\n");

  // Set up exchange users
  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(10000);

// Distribute Tokens 

    // User1 approves 10K rtbm
    transaction = await rtbm.connect(user1).approve(exchange.address, amount);
    await transaction.wait();
    console.log("Approved " +amount+ " tokens from " +user1.address+ "\n");

// Deposit Tokens to exchange
    // User1 deposits 10K rtbm to exchange
    transaction = await exchange.connect(user1).depositToken(rtbm.address, amount);
    await transaction.wait();
    console.log("Deposited "+amount+ " rtbm from " +user1.address+"\n"); 

// Distribute Tokens 
    // User2 approves REth
    transaction = await rEth.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log("Approved " +amount+ " tokens from " +user2.address+ "\n");

// Deposit Tokens to exchange    
    // User2 deposits rEth to exchange
    transaction = await exchange.connect(user2).depositToken(rEth.address, amount);
    await transaction.wait();
    console.log("Deposited "+amount+ " rEth from " +user2.address+"\n");




 // Seed a cancelled Order

    //User1 makes order to get 100 rEth tokens and give 5 rtbm tokens
    transaction = await exchange.connect(user1).makeOrder(rEth.address, tokens(100), rtbm.address, tokens(5));
    result = await transaction.wait();
    console.log("Made Order from "+user1.address+"\n");

    // User1 cancels order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait();
    console.log("Cancelled Order from "+user1.address+"\n");

    //Wait 1 Second
    await wait(1);

// Seed Filled Order

//FIRST ORDER
    //User1 makes order to get 100 rEth tokens and give 10 rtbm tokens
    transaction = await exchange.connect(user1).makeOrder(rEth.address, tokens(100), rtbm.address, tokens(10));
    result = await transaction.wait();
    console.log("Make Order from "+user1.address+ "\n");

    //User2 fills order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log("Filled Order from "+user1.address+ "\n");
    
    //Wait 1 Second
    await wait(1);

//SECOND ORDER
    //User1 makes ANOTHER ORDER to get 50 rEth tokens and give 15 rtbm tokens
    transaction = await exchange.connect(user1).makeOrder(rEth.address, tokens(50), rtbm.address, tokens(15));
    result = await transaction.wait();
    console.log("Make Order from "+user1.address+ "\n");

    //User2 fills ANOTHER ORDER
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log("Filled Order from "+user1.address+ "\n");

    //Wait 1 Second
    await wait(1);

//FINAL ORDER
    //User1 makes FINAL ORDER to get 200 rEth tokens and give 20 rtbm tokens
    transaction = await exchange.connect(user1).makeOrder(rEth.address, tokens(200), rtbm.address, tokens(20));
    result = await transaction.wait();
    console.log("Make Order from "+user1.address+ "\n"); 

    //User2 fills FINAL ORDER
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log("Filled Order from "+user1.address+ "\n");

    //Wait 1 Second
    await wait(1);

// Seed Open Orders
//Set Fictional Orders for Test Data

//User1 makes 10 orders
for (let i = 0; i <=10 ; i++) {
    transaction = await  exchange.connect(user1).makeOrder(rEth.address, tokens(10 * i), rtbm.address, tokens(10));
    result = await transaction.wait();
    console.log("Made Order from "+user1.address+ "\n");
    //Wait 1 Second
    await wait(1);
}

//User2 makes 10 orders
for (let i = 0; i <=10 ; i++) {
    transaction = await  exchange.connect(user2).makeOrder(rtbm.address, tokens(10), rEth.address, tokens(10 * i));
    result = await transaction.wait();
    console.log("Made Order from "+user2.address+ "\n");
    //Wait 1 Second
    await wait(1);
}

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
