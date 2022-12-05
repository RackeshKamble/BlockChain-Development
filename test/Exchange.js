const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (number) =>{
    return ethers.utils.parseUnits(number.toString(), "ether");
}

describe("Exchange", ()=> {

    let deployer, accounts,feeAccount,exchange, token1,user1,transaction, result ,token2 ,user2;
    
    //We'll charge 10% fee
    const feePercent=10;
    
    beforeEach(async()=>{
        
        //Fetch Token from Blockchain using ethers.js by deploying it first
        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");

        token1 = await Token.deploy("Rakesh's Token","RTBM","18","1000000");
        token2 = await Token.deploy("Mock Dai","rDAI","18","1000000");
        
        //Fetch Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];
        
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

    //WithDraw Token
    describe("Withdrawing Token", async () =>{
        
        let amount = tokens(10);       

        describe("Success", async () =>{

            beforeEach(async()=>{
                
                //Deposit Token before withdrawing
                //Approve Token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result= await transaction.wait();
                
                //Deposit Token to USER
                transaction = await exchange.connect(user1).depositToken(token1.address,amount);
                result= await transaction.wait();

                //NOW Withdraw Tokens
                transaction = await exchange.connect(user1).withdrawToken(token1.address,amount);
                result= await transaction.wait();
            })

            it("Withdraws Token Funds", async ()=>{ 
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await exchange.tokens(token1.address , user1.address)).to.equal(0);
                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(0);
            })

            it("emits a Withdraw event", async ()=> {
                const event = result.events[1]; // TWO Events are emitted
                expect(event.event).to.equal("Withdraw")

                const args = event.args;
                
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(0);
                })

  
        })
        describe("Failure", async () =>{
            it("Fails for unsufficient balance", async ()=>{
                //Attemt to withdraw tokens without deposite
                await expect(exchange.connect(user1).withdrawToken(token1.address , amount)).to.be.reverted;
            })
        })
    })


    //Just check balance
    //No pass fail here
    describe("Checking Balances", async () =>{
        
            let amount = tokens(1);   
        
            beforeEach(async()=>{
                //Approve Token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result= await transaction.wait();
                
                //Deposit Token to exchange
                transaction = await exchange.connect(user1).depositToken(token1.address,amount);
                result= await transaction.wait();
            })

            it("returns user balance", async ()=>{ 
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
            })            
    })

    //----------------------------MAKE & CANCEL ORDER----------------------------//

    describe("Making Orders" , async() => {
        let amount = tokens(1);

        describe("Success" , async() => {
            beforeEach(async ()=>{
                //Deposit Token before making order
                //Approve Token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result= await transaction.wait();
                
                //Deposit Token to USER
                transaction = await exchange.connect(user1).depositToken(token1.address,amount);
                result= await transaction.wait();

                //Make Order
                //1v1 Transfer so far
                transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address, amount);
                result= await transaction.wait();

            })

            it("Tracks the newly created orders", async ()=>{
                expect(await exchange.orderCount()).to.equal(1);
            })

            it("emits an Order event", async ()=> {
                const event = result.events[0]; 
                expect(event.event).to.equal("Order")

                const args = event.args;
                
                expect(args.id).to.equal(1);
                expect(args.user).to.equal(user1.address);
                expect(args.tokenGet).to.equal(token2.address);
                expect(args.amountGet).to.equal(tokens(1));
                expect(args.tokenGive).to.equal(token1.address);
                expect(args.amountGive).to.equal(tokens(1));
                expect(args.timestamp).to.at.least(1);
                })
        
        })  

        describe("Failure" , async() => {
            it("Rejects Order with no balance", async ()=> {
                await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1) , token1.address, tokens(1))).to.be.reverted;
            })        
        })  
        
    })    
    
    // Order actions
    // Need to make an order BEFORE CANCEL OR FILL
    describe("Order Actions" , async() => {

        let amount = tokens(1);

        beforeEach(async () =>{
            //Approve Token
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            result= await transaction.wait();

            //User 1 Deposit tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result= await transaction.wait();

            //Give Tokens to User 2
            transaction = await token2.connect(deployer).transfer(user2.address, tokens(100));
            result= await transaction.wait();
            
            //User 2 Deposits tokens RTBM & rDAI hence tokens(2)
            transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
            result= await transaction.wait();
            transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
            result= await transaction.wait();

            //Make an Order
            transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address, amount);
            result= await transaction.wait();
        })

        describe("Cancelling Orders" , async() => {
            
            describe("Success" , async() => {
                beforeEach(async () =>{
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result= await transaction.wait();  
                })

                it("updates cancelled orders", async ()=>{
                    expect(await exchange.orderCancelled(1)).to.equal(true);
                })

                it("emits a Cancel event", async ()=> {
                    const event = result.events[0]; 
                    expect(event.event).to.equal("Cancel")
    
                    const args = event.args;
                    
                    expect(args.id).to.equal(1);
                    expect(args.user).to.equal(user1.address);
                    expect(args.tokenGet).to.equal(token2.address);
                    expect(args.amountGet).to.equal(tokens(1));
                    expect(args.tokenGive).to.equal(token1.address);
                    expect(args.amountGive).to.equal(tokens(1));
                    expect(args.timestamp).to.at.least(1);
                    })
            })

            describe("Failure" , async() => {
                beforeEach(async () =>{
                    //Approve Token
                    transaction = await token1.connect(user1).approve(exchange.address, amount)
                    result= await transaction.wait();
        
                    //User 1 Deposit tokens
                    transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                    result= await transaction.wait();
        
                    //Make an Order
                    transaction = await exchange.connect(user1).makeOrder(token2.address , amount , token1.address, amount);
                    result= await transaction.wait();
                })        

                it("Rejects invalid Order Ids ", async ()=> {                   
                    //Check Invalid Order
                    const invalidOrderId = 99999;
                    await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted;
                }) 

                it("Rejects unAuthorized cancellations ", async ()=> {                   
                    //Check Invalid Order
                    const invalidOrderId = 99999;
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                }) 
            })
        })

        describe("Filling Orders" , async() => {
            
            describe("Success" , async() => {
            
                beforeEach( async ()=>{
                    //User 1 has RTBM token 
                    //User 2 has rDAI token 
                    
                    //User 2 fills orders
                    transaction = await exchange.connect(user2).fillOrder("1");
                    result = await transaction.wait();
                })

                it("Executes the trade and charge fees" , async ()=>{
                    // User 2 is transfering to User 1

                    //Token Give
                    //Check Balance RTBM token of User 1
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0));
                    //Check Balance RTBM token of User 2
                    expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1));

                    //Check Balance of RTBM token for fee Account
                    expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0));

                    //Token Get
                    //Check balance of rDAI token of User 1
                    expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1));

                    //Check balance of rDAI token of User 2
                    expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9));

                    //Check balance of rDAI token for fee Account
                    expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1));

                })
                it("Updates filled orders", async ()=> {
                    expect(await exchange.orderFilled(1)).to.equals(true);
                })

                it("Emits a Trade event", async ()=> {
                    const event = result.events[0]; 
                    expect(event.event).to.equal("Trade")
    
                    const args = event.args;
                    
                    expect(args.id).to.equal(1);
                    expect(args.user).to.equal(user2.address);//User 2 fills orders
                    expect(args.tokenGet).to.equal(token2.address);
                    expect(args.amountGet).to.equal(tokens(1));
                    expect(args.tokenGive).to.equal(token1.address);
                    expect(args.amountGive).to.equal(tokens(1));
                    expect(args.creator).to.equal(user1.address);
                    expect(args.timestamp).to.at.least(1);
                })
            })

            describe("Failure" , async ()=> {
                it("Rejects invalid Order Ids ", async ()=> {                   
                    //Check Invalid Order
                    const invalidOrderId = 99999;
                    await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted;
                })
                
                it("Rejects already filled orders ", async ()=> {                   
                    transaction = await exchange.connect(user2).fillOrder(1);
                    await transaction.wait();
                    
                    //Try to fill order again
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                }) 

                it("Rejects cancelled orders ", async ()=> {                   
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    await transaction.wait();
                    
                    //Try to fill order again
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                }) 
            })
        })
    })

    //----------------------------MAKE & CANCEL ORDER----------------------------//


})