//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol"; // Import Token we created

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    //Tokens Mapping
    mapping(address =>mapping(address => uint256)) public tokens;

    //Orders Mapping
    mapping(uint256 => _Order) public orders;

    //Orders Counter
    uint256 public orderCount;

    //Cancel Mapping
    mapping(uint256 => bool) public orderCancelled;

    //Trade Mapping
    mapping(uint256 => bool) public orderFilled;
    
    //Deposit Event
    event Deposit(
        address token , 
        address user , 
        uint256 amount , 
        uint256 balance
        );
    
    //Withdraw Event
    event Withdraw(
        address token , 
        address user , 
        uint256 amount , 
        uint256 balance
        );
   
    //Order Event
    event Order(
        uint256 id,
        address user,         
        address tokenGet,
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive,
        uint256 timestamp
        );

     //Cancel Event
    event Cancel(
        uint256 id,
        address user,         
        address tokenGet,
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive,
        uint256 timestamp
        );

     //Trade Event
    event Trade(
        uint256 id,
        address user,         
        address tokenGet,
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive,
        address creator,
        uint256 timestamp
        );
    

    //Way to model the order
    //Orders Struct
    struct _Order {
        //Unique Identifier for order
        uint256 id;
        //user who made order
        address user; 
        
        address tokenGet;
        uint256 amountGet; 
        address tokenGive; 
        uint256 amountGive;

        //Time of Order creation
        //Epoch Time used in secs since Jan 1 1970
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent=_feePercent;
    }

        //Deposit Tokens
        function depositToken(address _token, uint256 _amount) public{
            //Transfer token to exchange
            // call smart contract from Token.sol // From , to , value
            require(Token(_token).transferFrom(msg.sender, address(this), _amount));

            //Update Balance
            tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount ;

            //Emit Deposit Event
            emit Deposit(_token , msg.sender , _amount , tokens[_token][msg.sender]);
        }

        // Check Balances
        // Wrapper function to check balance
        function balanceOf(address _token , address _user) public view returns (uint256){
            return tokens[_token][_user];
        }

       //Withdraw token // Opposite of Deposit logic
        function withdrawToken(address _token , uint256 _amount) public {

            // Ensure user has enough tokens to withdraw
            require(tokens[_token][msg.sender] >= _amount);

            // Update user balance
            Token(_token).transfer(msg.sender, _amount);

            //Transfer token to USER not exchange
            //Update Balance
            tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount ;

            //Emit Event
            emit Withdraw(_token , msg.sender , _amount , tokens[_token][msg.sender]);
        }

        //----------------------------MAKE & CANCEL ORDER----------------------------//
        
        //Token Give(The token they wanna spend) -- which token & how much
        //Token Get (The token they wanna receive) -- which token & how much
        function makeOrder(
            address _tokenGet , 
            uint256 _amountGet , 
            address _tokenGive , 
            uint256 _amountGive) public {
            
            //Prevent Order if tokens aren't on balance
            require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
            //Make Order
            orderCount = orderCount +1;
            
            orders[orderCount] = _Order(
                orderCount,
                msg.sender,
                _tokenGet, 
                _amountGet, 
                _tokenGive, 
                _amountGive, 
                block.timestamp);

            // Emit Make Order event
            emit Order(
                orderCount,
                msg.sender,
                _tokenGet, 
                _amountGet, 
                _tokenGive, 
                _amountGive, 
                block.timestamp
            );
        }

        //CANCEL ORDER
        function cancelOrder(uint256 _id) public {
            //Fetch Order
            
            //Below shows how to fetch from struct
            _Order storage _order =orders[_id];

            //Ensure function caller is owner of order
            require(address(_order.user) == msg.sender);

            //Order Must Exist
            require(_order.id == _id);

            //Cancel Order
            orderCancelled[_id]= true;

            // Emit Cancel Order event
            emit Cancel(
                _order.id,
                msg.sender,
                _order.tokenGet, 
                _order.amountGet, 
                _order.tokenGive, 
               _order.amountGive, 
                block.timestamp
            );
        }
//----------------------------MAKE & CANCEL ORDER----------------------------//

//----------------------------Execute / Fill ORDER----------------------------//
    function fillOrder(uint256 _id) public {
        
        // 1. Must be valid orderID
        require(_id > 0 && _id <=orderCount , "Order Doesn't Exist");

        // 2. Order can't be filled
        require(!orderFilled[_id]);
        
        // 3. Order can't be cancelled
        require(!orderCancelled[_id]);
        
        //Fetch Order
        //Below shows how to fetch from struct
        _Order storage _order =orders[_id];
        
        //Swapping Tokens(Trading)
        //Execute Trade
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        //Mark Order as Filled
        orderFilled[_order.id]=true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {

            //Fee paid by order filler (msg.sender)
            //Fee Deducted from _amountGet

            //10 % charge
            uint256 _feeAmount = (_amountGet * feePercent) / 100;

            //Do Trade here
            
            //[msg.sender] is order filler User 2
            //[_user] is order creater User1

            //Get rDAI token from User 2 tokens[_tokenGet][msg.sender]
            tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
            
            //Give rDAI token to User 1 tokens[_tokenGet][_user]
            tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

            //Charge 10% Fees
            tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

            //Get RTBM token from User 1 tokens[_tokenGet][_user]
            tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;

            //Give RTBM token to User 2 tokens[_tokenGet][msg.sender]
            tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;
            
            // Emit Trade event
            emit Trade(
                _orderId,
                msg.sender,
                _tokenGet, 
                _amountGet, 
                _tokenGive, 
               _amountGive, 
               _user,
                block.timestamp
            );
        }


//----------------------------Execute / Fill ORDER----------------------------//



}