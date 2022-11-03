[1mdiff --git a/contracts/Exchange.sol b/contracts/Exchange.sol[m
[1mindex d6cf925..b8ad283 100644[m
[1m--- a/contracts/Exchange.sol[m
[1m+++ b/contracts/Exchange.sol[m
[36m@@ -9,36 +9,62 @@[m [mcontract Exchange{[m
     uint256 public feePercent;[m
 [m
     mapping(address =>mapping(address => uint256)) public tokens;[m
[31m-[m
[32m+[m[41m    [m
[32m+[m[32m    //Deposit Event[m
     event Deposit([m
         address token , [m
         address user , [m
         uint256 amount , [m
         uint256 balance[m
         );[m
[32m+[m[41m    [m
[32m+[m[32m    //Withdraw Event[m
[32m+[m[32m    event Withdraw([m
[32m+[m[32m        address token ,[m[41m [m
[32m+[m[32m        address user ,[m[41m [m
[32m+[m[32m        uint256 amount ,[m[41m [m
[32m+[m[32m        uint256 balance[m
[32m+[m[32m        );[m
 [m
     constructor(address _feeAccount, uint256 _feePercent){[m
         feeAccount = _feeAccount;[m
         feePercent=_feePercent;[m
     }[m
 [m
[31m-    //Deposit Tokens[m
[31m-    function depositToken(address _token, uint256 _amount) public{[m
[31m-        //Transfer token to exchange[m
[31m-        // call smart contract from Token.sol // From , to , value[m
[31m-        require(Token(_token).transferFrom(msg.sender, address(this), _amount));[m
[32m+[m[32m        //Deposit Tokens[m
[32m+[m[32m        function depositToken(address _token, uint256 _amount) public{[m
[32m+[m[32m            //Transfer token to exchange[m
[32m+[m[32m            // call smart contract from Token.sol // From , to , value[m
[32m+[m[32m            require(Token(_token).transferFrom(msg.sender, address(this), _amount));[m
 [m
[31m-        //Update Balance[m
[31m-        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount ;[m
[32m+[m[32m            //Update Balance[m
[32m+[m[32m            tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount ;[m
 [m
[31m-        //Emit Deposit Event[m
[31m-        emit Deposit(_token , msg.sender , _amount , tokens[_token][msg.sender]);[m
[31m-    }[m
[31m-    // Check Balances[m
[31m-    // Wrapper function to check balance[m
[31m-    function balanceOf(address _token , address _user) public view returns (uint256){[m
[31m-        return tokens[_token][_user];[m
[31m-    }[m
[32m+[m[32m            //Emit Deposit Event[m
[32m+[m[32m            emit Deposit(_token , msg.sender , _amount , tokens[_token][msg.sender]);[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        // Check Balances[m
[32m+[m[32m        // Wrapper function to check balance[m
[32m+[m[32m        function balanceOf(address _token , address _user) public view returns (uint256){[m
[32m+[m[32m            return tokens[_token][_user];[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m       //Withdraw token // Opposite of Deposit logic[m
[32m+[m[32m        function withdrawToken(address _token , uint256 _amount) public {[m
[32m+[m
[32m+[m[32m            // Ensure user has enough tokens to withdraw[m
[32m+[m[32m            require(tokens[_token][msg.sender] >= _amount);[m
[32m+[m[41m            [m
[32m+[m[32m            // Update user balance[m
[32m+[m[32m            Token(_token).transfer(msg.sender, _amount);[m
[32m+[m
[32m+[m[32m            //Transfer token to USER not exchange[m
[32m+[m[32m            //Update Balance[m
[32m+[m[32m            tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount ;[m
 [m
[32m+[m[32m            //Emit Event[m
[32m+[m[32m            emit Withdraw(_token , msg.sender , _amount , tokens[_token][msg.sender]);[m
[32m+[m[32m        }[m
 [m
 }[m
\ No newline at end of file[m
[1mdiff --git a/test/Exchange.js b/test/Exchange.js[m
[1mindex 45d7250..51d6365 100644[m
[1m--- a/test/Exchange.js[m
[1m+++ b/test/Exchange.js[m
[36m@@ -92,4 +92,77 @@[m [mdescribe("Exchange", ()=> {[m
             })[m
         })[m
     })[m
[32m+[m
[32m+[m[32m    //WithDraw Token[m
[32m+[m[32m    describe("Withdrawing Token", async () =>{[m
[32m+[m[41m        [m
[32m+[m[32m        let amount = tokens(10);[m[41m       [m
[32m+[m
[32m+[m[32m        describe("Success", async () =>{[m
[32m+[m
[32m+[m[32m            beforeEach(async()=>{[m
[32m+[m[41m                [m
[32m+[m[32m                //Deposit Token before withdrawing[m
[32m+[m[32m                //Approve Token[m
[32m+[m[32m                transaction = await token1.connect(user1).approve(exchange.address, amount)[m
[32m+[m[32m                result= await transaction.wait();[m
[32m+[m[41m                [m
[32m+[m[32m                //Deposit Token to USER[m
[32m+[m[32m                transaction = await exchange.connect(user1).depositToken(token1.address,amount);[m
[32m+[m[32m                result= await transaction.wait();[m
[32m+[m
[32m+[m[32m                //NOW Withdraw Tokens[m
[32m+[m[32m                transaction = await exchange.connect(user1).withdrawToken(token1.address,amount);[m
[32m+[m[32m                result= await transaction.wait();[m
[32m+[m[32m            })[m
[32m+[m
[32m+[m[32m            it("Withdraws Token Funds", async ()=>{[m[41m [m
[32m+[m[32m                expect(await token1.balanceOf(exchange.address)).to.equal(0);[m
[32m+[m[32m                expect(await exchange.tokens(token1.address , user1.address)).to.equal(0);[m
[32m+[m[32m                expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(0);[m
[32m+[m[32m            })[m
[32m+[m
[32m+[m[32m            it("emits a Withdraw event", async ()=> {[m
[32m+[m[32m                const event = result.events[1]; // TWO Events are emitted[m
[32m+[m[32m                expect(event.event).to.equal("Withdraw")[m
[32m+[m
[32m+[m[32m                const args = event.args;[m
[32m+[m[41m                [m
[32m+[m[32m                expect(args.token).to.equal(token1.address);[m
[32m+[m[32m                expect(args.user).to.equal(user1.address);[m
[32m+[m[32m                expect(args.amount).to.equal(amount);[m
[32m+[m[32m                expect(args.balance).to.equal(0);[m
[32m+[m[32m                })[m
[32m+[m
[32m+[m[41m  [m
[32m+[m[32m        })[m
[32m+[m[32m        describe("Failure", async () =>{[m
[32m+[m[32m            it("Fails for unsufficient balance", async ()=>{[m
[32m+[m[32m                //Attemt to withdraw tokens without deposite[m
[32m+[m[32m                await expect(exchange.connect(user1).withdrawToken(token1.address , amount)).to.be.reverted;[m
[32m+[m[32m            })[m
[32m+[m[32m        })[m
[32m+[m[32m    })[m
[32m+[m
[32m+[m
[32m+[m[32m    //Check Balances[m
[32m+[m[32m    describe("Checking Balances", async () =>{[m
[32m+[m[41m        [m
[32m+[m[32m            let amount = tokens(1);[m[41m   [m
[32m+[m[41m        [m
[32m+[m[32m            beforeEach(async()=>{[m
[32m+[m[32m                //Approve Token[m
[32m+[m[32m                transaction = await token1.connect(user1).approve(exchange.address, amount)[m
[32m+[m[32m                result= await transaction.wait();[m
[32m+[m[41m                [m
[32m+[m[32m                //Deposit Token to exchange[m
[32m+[m[32m                transaction = await exchange.connect(user1).depositToken(token1.address,amount);[m
[32m+[m[32m                result= await transaction.wait();[m
[32m+[m[32m            })[m
[32m+[m
[32m+[m[32m            it("returns user balance", async ()=>{[m[41m [m
[32m+[m[32m                expect(await token1.balanceOf(exchange.address)).to.equal(amount);[m
[32m+[m[32m            })[m[41m            [m
[32m+[m[32m    })[m
[32m+[m
 })[m
\ No newline at end of file[m
