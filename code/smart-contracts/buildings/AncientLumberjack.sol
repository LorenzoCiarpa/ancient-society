// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Helper functions OpenZeppelin provides.
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/access/Ownable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/utils/cryptography/MerkleProof.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/utils/Strings.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/access/Ownable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/utils/cryptography/MerkleProof.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/utils/Strings.sol";


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AncientLumberjack is ERC721Enumerable, Ownable {
    using Strings for uint256;

    //OPENING AND CLOSING VARIABLES
    bool public isMintOpen;

    //MINTING NUMBER CONSTANTS
    uint256 private MAX_LUMBERJACK = 4000;

    //METADATA
    string private baseURI;

    //PRICES
    uint256 public mintPriceMatic = 10 ** 16;

    //ADDRESSES
    address public foundersWallet;

    //MANAGERS
    mapping(address => bool) public managers;

    //ADDRESS CONTROL
    bytes32 public whitelistMerkleRoot;

    //Map address to the nft number of nfts mintable
    mapping(address => uint256) public mintAllowance;

    //Map address to the number of nfts minted
    mapping(address => uint256) public nftMinted;

    //EVENTS
    event Mint(address indexed player, uint256 indexed tokenId);

    constructor() ERC721 ("AncientLumberjack", "ALJ") Ownable (msg.sender){
        baseURI = "";
        foundersWallet = 0x26881c56f7791e8f36cCF0A337CA2c53f0Ae10c8;
        managers[msg.sender] = true;
    }

    modifier onlyMinter(uint256 _numberOfTokens){
        require(isMintOpen, "Mint not open");
        require(totalSupply() + _numberOfTokens <= MAX_LUMBERJACK,"max-supply");
        _;
    }

    modifier onlyWhitelist(address player, uint256 _numberOfTokens,  bytes32[] calldata merkleProof){
        require(isMintOpen, "Mint not open");
        require(totalSupply() + _numberOfTokens <= MAX_LUMBERJACK,"max-supply");
        
        bool isWhitelisted = MerkleProof.verify(
            merkleProof, //routeProof
            whitelistMerkleRoot, //root
            keccak256(abi.encodePacked(player)/* leaf */)
        );

        require(isWhitelisted, "invalid-proof");
        require(nftMinted[player] + _numberOfTokens <= mintAllowance[player], "max-mint");
        _;
    }

    modifier onlyManager(address sender){
        require(managers[sender] == true, "not a manager");
        _;
    }

    //MANAGER
    function setManagerStatus(address manager, bool status) external onlyOwner {
        managers[manager] = status;
    }

    //FOUNDERS WALLET (private doesn't mean invisible, anyone can see it)
    function setFoundersWallet(address newFoundersWallet) external onlyOwner{
        foundersWallet = newFoundersWallet;
    }

    //CONTROL FUNCTIONS
    function updateWhitelistMerkleRoot(bytes32 _newMerkleRoot) external onlyManager(msg.sender) {
        whitelistMerkleRoot = _newMerkleRoot;
    }

    //GET MAX ALLOWANCE FOR WHITELISTED ADDRESS
    function getMintAllowancePerAddress(address address_) public view returns(uint256){
        return mintAllowance[address_];
    }

    //GET MAX ALLOWANCE FOR WHITELISTED ADDRESS
    function setMintAllowancePerAddress(address address_, uint256 allowance_) external onlyManager(msg.sender) {
        mintAllowance[address_] = allowance_;
    }

    //METADATA
    function setBaseURI(string memory baseURI_) external onlyManager(msg.sender) {
        baseURI = baseURI_;
    }

    function tokenURI(uint256 tokenId) public override view returns(string memory) {
        return string(abi.encodePacked(baseURI, "/", tokenId.toString()));
    }

    //GETTERS AND SETTERS OF PRICES
    function setPrice(uint256 public_matic_price_) external onlyManager(msg.sender){
        mintPriceMatic = public_matic_price_;
    }

    //OPENING AND CLOSING FUNCTIONS
    function setMintOpen(bool isMintOpen_) external onlyManager(msg.sender){
        isMintOpen = isMintOpen_;
    }

    //MINTING FUNCTIONS

    //MINTING MATIC
    function mint(address player, uint256 _numberOfTokens) external payable onlyMinter(_numberOfTokens){
        uint256 mintPrice = mintPriceMatic;

        require(msg.value >= mintPrice * _numberOfTokens, "inc-pol-val");

        for (uint256 i = 0; i < _numberOfTokens; i++) {
            _safeMint(player, totalSupply());
        }
    }

    //MINTING WHITELIST
    function mintWhitelist(address player, uint256 _numberOfTokens,  bytes32[] calldata merkleProof) external onlyWhitelist(player, _numberOfTokens, merkleProof){
        
        for (uint256 i = 0; i < _numberOfTokens; i++) {
            _safeMint(player, totalSupply());
        }

        nftMinted[player] += _numberOfTokens;
    }

    function airdrop(address player, uint256 _numberOfTokens) external onlyManager(msg.sender){
        for (uint256 i = 0; i < _numberOfTokens; i++) {
            _safeMint(player, totalSupply());
        }
    } 

    //FUND AND WITHDRAW
    function withdraw() external onlyManager(msg.sender) {
        uint256 _balance = address(this).balance;
        payable(foundersWallet).transfer(_balance);
    }
}
