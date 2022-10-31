const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Exchange", ()=> {

    let deployer, accounts,feeAccount,exchange;
    
    //We'll charge 10% fee
    const feePercent=10;
    
    beforeEach(async()=>{
        
        //Fetch Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(feeAccount.address, feePercent); 

    })

    //Deployment
    describe("Deployment of Tokens", ()=>{

        //Tests Written here
        //Chai EXPECT used

        it("tracks the fee account", async ()=>{        
            //Check if fee Account is correct           
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        })

        it("tracks the fee percent", async ()=>{        
            //Check if fee Percent is correct           
            expect(await exchange.feePercent()).to.equal(feePercent);
        })    
    }) 
})