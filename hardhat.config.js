require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || "" ;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });
// eslint-disable-next-line no-undef
task("balance", "Prints an account's balance").setAction(async () => {});
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks :{
    localhost:{},
    goerli :{
      url : 'https://goerli.infura.io/v3/421199f0845348f696444a4b8df93dbd' , 
      accounts : privateKeys.split(',')
    },
    mumbai :{
      url : 'https://polygon-mumbai.g.alchemy.com/v2/2JV1eFq0PPg5204di-DKxKYvrW1uBSVL' , 
      accounts : privateKeys.split(',')
    }
  },
  browser: true,
};
