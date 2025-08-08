// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AncientLand is ERC721Enumerable, Ownable {
    using Strings for uint256;

    //MINTING NUMBER CONSTANTS
    uint256 private MAX_LAND = 250;

    string private baseURI;

    //SIGNER
    address public signerWallet;

    //MANAGERS
    mapping(address => bool) public managers;

    event LandMint(address player, uint256 tokenId);

    constructor() ERC721 ("AncientLand", "ALD") Ownable (msg.sender) {
        baseURI = "https://www.api.ancientsociety.io/reveal/metadata/land";
        managers[msg.sender] = true;
    }

    modifier onlyManager(address sender){
        require(managers[sender] == true, "not a manager");
        _;
    }

    //MANAGER
    function setManagerStatus(address manager, bool status) external onlyOwner {
        managers[manager] = status;
    }

    //SIGNER
    function setSignerWallet(address newSignerWallet) external onlyManager(msg.sender){
        signerWallet = newSignerWallet;
    }

    //METADATA
    function setBaseURI(string memory baseURI_) external onlyManager(msg.sender) {
        baseURI = baseURI_;
    }

    function tokenURI(uint256 tokenId) public override view returns(string memory) {
        return string(abi.encodePacked(baseURI, "/", tokenId.toString()));
    }

    //AIDROP FUNCTION
    function airdrop(address player, uint256 _numberOfTokens) external onlyManager(msg.sender){
        for (uint256 i = 0; i < _numberOfTokens; i++) {
            _safeMint(player, totalSupply());
        }
    } 
}
