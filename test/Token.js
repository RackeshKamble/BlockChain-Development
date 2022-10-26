const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Token", ()=> {

    let token;
    beforeEach(async()=>{
        
        //Duplicate /reusble code goes here
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Rakesh's Token","RTBM","18","1000000");

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
            expect(await token.name()).equal(name);
        })
    
        it("has a symbol", async ()=>{
            //Check if Symbol is correct
            expect(await token.symbol()).equal(symbol);
        })
    
        it("has a decimal", async ()=>{
            //Check if decimals are correct
            expect(await token.decimals()).equal(decimals);
        })
    
        it("has a total supply", async ()=>{
            //Check if totalSupply are correct
            expect(await token.totalSupply()).equal(totalSupply);
        })
    }) 

})