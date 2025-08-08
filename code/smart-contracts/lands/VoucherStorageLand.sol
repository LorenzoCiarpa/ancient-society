// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VoucherStorageLand is Ownable {

    address public tokenAddress;
    uint256 public maplenCreation;
    uint256 public maplenDeletion;
    mapping(bytes => bool) public voucherCreation;
    mapping(bytes => bool) public voucherDeletion;

    constructor() Ownable (msg.sender) {

    }
    
    function setTokenAddress(address newTokenAddress) external onlyOwner{
        tokenAddress = newTokenAddress;
    }

    function setVoucher(bytes memory signature, bool creation) external {
        require(msg.sender == tokenAddress, "Caller is not token contract");
        if(creation == true){
            voucherCreation[signature] = true;
            maplenCreation += 1;
        }else{
            voucherDeletion[signature] = true;
            maplenDeletion += 1;
        }
    }

    function getVoucherCreation(bytes memory signature) external view returns(bool){
        return voucherCreation[signature];
    }

    function getVoucherDeletion(bytes memory signature) external view returns(bool){
        return voucherDeletion[signature];
    }
}