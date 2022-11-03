//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol"; // Import Token we created

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    mapping(address =>mapping(address => uint256)) public tokens;
    
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

}