
const { ethers } = require("hardhat");
//const hre = require("hardhat");

async function main() {
    //Fetch Contract to Deploy
    const Token = await ethers.getContractFactory("Token")

    //Deploy Contract
    const token= await Token.deploy();
    await token.deployed();
    console.log("Token Deployed to " + token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
