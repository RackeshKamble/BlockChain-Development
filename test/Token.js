const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Token", ()=> {

    let token, accounts, deployer, receiver,exchange;
    beforeEach(async()=>{
        
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Rakesh's Token","RTBM","18","1000000");
        //token = await Token.deploy("Rakesh's Token","RTBM","1000000");
        

        //Fetch Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
        exchange = accounts[2];

    })

    //Read Functions
    describe("Deployment of Tokens", ()=>{

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
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        })
    }) 

    //Write Functions
    describe("Transfer of Tokens", () => {

        let amount,transaction,result;

        describe("Success", async ()=>{
            beforeEach(async ()=>{
                //Transfer Token
                amount = tokens(100);
                transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            })
    
            it("transfer token balance", async () => {
          
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));            
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
                //Ensure Tokens were transfered(Balance Change)
            })
    
            it("emits a transfer event", async ()=> {
                const event = result.events[0];            
                expect(event.event).to.equal("Transfer");
                
                const args = event.args;
                expect(args.from).to.equal(deployer.address);
                expect(args.to).to.equal(receiver.address);
                expect(args.value).to.equal(amount);
            })
        })

        describe("Failure", async()=>{
            it("rejects insufficient balance", async()=>{
                //Transfer more tokens than deployer has - 100M
                const invalidAmount= tokens(100000000);
                //Waffle assertion to throw erros .to.be.reverted
                await expect(token.connect(deployer).transfer(receiver.address,invalidAmount)).to.be.reverted;
            })

            it("rejects insufficient recipent", async()=>{
                //Invalid Recipent dummy zero address
                const amount= tokens(100);
                //Waffle assertion to throw erros .to.be.reverted
                await expect(token.connect(deployer).transfer("0x0000000000000000000000000000000000000000",amount)).to.be.reverted;
            })
        })    
        
        describe("Approval of Tokens", async () =>{
            
            let amount,transaction,result;

            beforeEach(async ()=>{
                amount = tokens(100);
                transaction = await token.connect(deployer).approve(exchange.address, amount);
                result = await transaction.wait();
            })
            describe("Success", async () => {
                it("allocates an allowance for delegated token spending" , async () =>{
                    expect (await token.allowance(deployer.address,exchange.address)).to.equal(amount);
                })

                it("emits an approval event", async ()=> {
                    const event = result.events[0];            
                    expect(event.event).to.equal("Approve");
                    
                    const args = event.args;
                    expect(args.owner).to.equal(deployer.address);
                    expect(args.spender).to.equal(exchange.address);
                    expect(args.value).to.equal(amount);
                })
            })

            describe("Failure", async () => {
                it("rejects invalid spenders", async ()=>{
                    await expect(token.connect(deployer).approve("0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
                })
            })
            
        })
        describe("Delegated Transfer of Tokens", async () =>{
            
            let amount,transaction,result;
            //Approval is the first step here
            //Exchange approves first then Deployer -> Receiver
            beforeEach(async ()=>{
                amount = tokens(100);
                transaction = await token.connect(deployer).approve(exchange.address, amount);
                result = await transaction.wait();
            })

            describe("Success", async () => {
                
                beforeEach(async ()=>{
                    //Deployer -> Receiver
                    //Connect to exchange
                    transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
                    result = await transaction.wait();
                })

                it("transfer token balances", async ()=>{                                
                    expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('999900', 'ether'));
                    expect(await token.balanceOf(receiver.address)).to.be.equal(amount);
                })
                
                it("resets the allowance", async ()=>{
                    expect(await token.allowance(deployer.address , exchange.address)).to.be.equal(0);
                })
                
                //Deployer -> Receiver
                it("emits a transfer event", async ()=> {
                    const event = result.events[0]
                    expect(event.event).to.equal('Transfer')

                    const args = event.args
                    expect(args.from).to.equal(deployer.address)
                    expect(args.to).to.equal(receiver.address)
                    expect(args.value).to.equal(amount)
                })

            })
            describe("Failure", async () => {
                it("Attempt to transfer too many tokens", async ()=>{
                    //Transfer more tokens than deployer has - 100M
                    const invalidAmount= tokens(100000000);
                    await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address,invalidAmount)).to.be.reverted;
                })
            })

        })
    })
})