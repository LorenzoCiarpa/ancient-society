// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VoucherStorage is Ownable {

    address public tokenAddress;
    uint256 public maplen;
    mapping(bytes => bool) public voucherMap;

    constructor() Ownable (msg.sender){
    }
    
    function setTokenAddress(address newTokenAddress) external onlyOwner{
        tokenAddress = newTokenAddress;
    }

    function setVoucher(bytes memory signature) external {
        require(msg.sender == tokenAddress, "Caller is not token contract");
        voucherMap[signature] = true;
        maplen += 1;
    }

    function getVoucher(bytes memory signature) external view returns(bool){
        return voucherMap[signature];
    }
}