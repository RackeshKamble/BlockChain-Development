//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token{
    //Name
    string public name; 
    
    //Symbol
    string public symbol;

    //Decimals - Unsigned integer which is not negative 18 zeros in gwei
    uint256 public decimals;

    //Total Supply 10 millions 10 to exponent of decimal value i.e. 18 Gwie value
    uint256 public totalSupply;

    //Track Balance
    //mapping is datastructure holds key-value pair
    mapping(address => uint256) public balanceOf;
    
    //Approve
    //Nested mapping spender and exchange address
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from, 
        address indexed to, 
        uint256 value
        );

    event Approve(
        address indexed owner,
        address indexed spender,
        uint256 value

    );

    //Send Tokens

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _decimals,
        uint256 _totalSupply
        ) {
        name=_name;
        symbol=_symbol;
        decimals=_decimals;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender]= totalSupply;
    }

    function transfer(address _to , uint256 _value) public returns(bool success)
    {
        //Require that spender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);
        //Check invalid receipent
        //i.e.  0x0000000000000000000000000000000000000000
        require(_to != address(0));

        //Dedcut tokens from spender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        //Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;

        //Emit Transfer Event
        emit Transfer(msg.sender , _to ,_value);
        return true;
    }

    function approve(address _spender , uint256 _value) public returns(bool success){
        //Check invalid spender
        require(_spender != address(0));
        
        allowance[msg.sender][_spender] = _value;
        
        //Emit Approve Event
        emit Approve(msg.sender, _spender, _value);
        
        return true;
        
    }
}


