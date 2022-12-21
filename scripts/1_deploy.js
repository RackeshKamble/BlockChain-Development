
const { ethers } = require("hardhat");
//const hre = require("hardhat");
console.log("Preparing Deployment \n")

async function main() {
    //Fetch Contract to Deploy
    const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");

    //Fetch Accounts
    const accounts =await ethers.getSigners()
    
    console.log("Accounts Fetched " + accounts[0].address + "\n" );
    console.log("Accounts Fetched " + accounts[1].address + "\n" );

    //Deploy Contract
    //Deploy RTBM Token
    const rtbm= await Token.deploy("Rakesh's Token","RTBM","18","1000000");
    await rtbm.deployed();
    console.log("RTBM Token Deployed to " + rtbm.address);

    //Deploy REth Token -- Mocked WETH
    const rEth= await Token.deploy("Mock Eth","REth","18","1000000");
    await rEth.deployed();
    console.log("REth Token Deployed to " + rEth.address);

    //Deploy RDai Token -- Mocked DAI
    const rDai= await Token.deploy("Mock Dai","rDAI","18","1000000");
    await rDai.deployed();
    console.log("RDAI Token Deployed to " + rDai.address);

    //Deploy Exchange
    const exchange = await Exchange.deploy(accounts[1].address , 10);
    await exchange.deployed();
    console.log("Exchange Deployed to   " + exchange.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
