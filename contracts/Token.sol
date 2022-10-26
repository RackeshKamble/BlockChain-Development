//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token{
    //Name
    string public name; 
    
    //Symbol
    string public symbol;

    //Decimals
    //unsigned integer which is not negative
    //18 zeros in gwei
    uint256 public decimals;

    //Total Supply
    //10 millions 10 to exponent of decimal value i.e. 18
    //Gwie value
    uint256 public totalSupply;

    constructor(string memory _name, string memory _symbol, uint256 _decimals ,uint256 _totalSupply){
        name=_name;
        symbol=_symbol;
        decimals=_decimals;
        totalSupply = _totalSupply * (10**decimals);
    }
}


