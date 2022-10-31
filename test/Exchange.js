const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Exchange", ()=> {

    let deployer, accounts,feeAccount,exchange, token1,user1,transaction, result;
    
    //We'll charge 10% fee
    const feePercent=10;
    
    beforeEach(async()=>{
        
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");

        token1 = await Token.deploy("Rakesh's Token","RTBM","18","1000000");
        
        //Fetch Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        
        //Transfer Token
        transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
        
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
    
    //Deposit Tokens
    describe("Depositing Token", async () =>{
        
        let amount = tokens(10);       

        describe("Success", async () =>{

            beforeEach(async()=>{
                //Approve Token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result= await transaction.wait();
                
                //Deposit Token to exchange
                transaction = await exchange.connect(user1).depositToken(token1.address,amount);
                result= await transaction.wait();
            })

            it("tracks the token deposit", async ()=>{ 
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address , user1.address)).to.equal(amount);
                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(amount);
            })

             it("emits a deposit event", async ()=> {
                const event = result.events[1]; // TWO Events are emitted
                expect(event.event).to.equal("Deposit")

                const args = event.args;
                
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(amount);
                })
        })
        describe("Failure", async () =>{
            it("Fails if tokens are not approved", async ()=>{
                //Don't approve tokens before Deposit
                await expect(exchange.connect(user1).depositToken(token1.address , amount)).to.be.reverted;
            })
        })
    })
})