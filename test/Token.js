const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Token", ()=> {

    let token, accounts, deployer;
    beforeEach(async()=>{
        
        //Duplicate /reusble code goes here
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Rakesh's Token","RTBM","18","1000000");

        //Fetch Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];

    })

    describe("Deployment", ()=>{

        const name="Rakesh's Token";
        const symbol="RTBM";
        const decimals=18;
        const totalSupply=tokens("1000000");

        //Tests Written here
         //Chai EXPECT used

        it("has a name", async ()=>{        
            //Check if name is correct           
            expect(await token.name()).to.equal(name);
        })
    
        it("has a symbol", async ()=>{
            //Check if Symbol is correct
            expect(await token.symbol()).to.equal(symbol);
        })
    
        it("has a decimal", async ()=>{
            //Check if decimals are correct
            expect(await token.decimals()).to.equal(decimals);
        })
    
        it("has a total supply", async ()=>{
            //Check if totalSupply are correct
            expect(await token.totalSupply()).to.equal(totalSupply);
        })

        it("assigns total supply to a developer", async ()=>{
            //Check if balance is correct
            //console.log(deployer.address);
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        })
    }) 

})