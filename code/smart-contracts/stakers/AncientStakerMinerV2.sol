// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import "./AncientMiner.sol";

//STAKER FOR MULTIPLE CITIES (COLONIES)
contract AncientStakerMinerV2 is Ownable, IERC721Receiver {

    //STRUCT
    struct Stake {
        bool isStaked;
        uint48 timestamp;
        address owner;
    }

    //EVENTS
    event NFTStaked(address indexed owner, uint256 indexed tokenId, uint256 value);
    event NFTUnstaked(address indexed owner, uint256 indexed tokenId, uint256 value);

    //VARIABLES

    bool public isStakerOpen = true;
    bool public isSingleStaker = false;

    uint256 public totalStaked;    

    mapping(address => bool) public managers;

    //owner's balance
    mapping(address => uint256) public balances;

    // Mapping from owner to list of owned token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) public ownedTokensIndex;

    //MAPPING FOR STAKING BY tokenId
    mapping(uint256 => Stake) public tokenStaked;

    AncientMiner public building;

    

    constructor(address bld_) Ownable (msg.sender){
        building = AncientMiner(bld_);
        managers[msg.sender] = true;
    }

    modifier onlyManager(address manager){
        require(managers[manager], "not a manager");
        _;
    }

    function stake(uint256 tokenId) external {

        require(isStakerOpen, "staker not open");
        require(building.ownerOf(tokenId) == msg.sender, "not your token");
        require(building.getApproved(tokenId) == address(this), "contract-not-allowed");


        require(tokenStaked[tokenId].isStaked == false, "tokenId already staked"); 

        if(isSingleStaker){
            require(balances[msg.sender] == 0, "cannot stake other buildings");
        }


        building.transferFrom(msg.sender, address(this), tokenId);
        

        tokenStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        uint256 length = balances[msg.sender];

        _ownedTokens[msg.sender][length] = tokenId;
        ownedTokensIndex[tokenId] = length;

        balances[msg.sender] += 1;
        
        totalStaked += 1;

        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }

    function unstake(uint256 tokenId) external {
        address tokenOwner = tokenStaked[tokenId].owner;

        require(tokenStaked[tokenId].owner == msg.sender || managers[msg.sender], "not owner or manager"); 
        require(tokenStaked[tokenId].isStaked == true, "tokenId not staked");

        
        building.transferFrom(address(this), tokenOwner, tokenId);

        tokenStaked[tokenId].isStaked = false;
        tokenStaked[tokenId].timestamp = uint48(block.timestamp);

        uint256 lastIndex = balances[tokenOwner] - 1;

        uint256 index = ownedTokensIndex[tokenId];
        uint256 lastElem = _ownedTokens[msg.sender][lastIndex];
        
        if(index != lastIndex){
            //Move last element to the position of the unstaked token(and delete old tokenId)
            _ownedTokens[msg.sender][index] = lastElem;
            //Set new index to the ex-last element
            ownedTokensIndex[lastElem] = index;
        }

        //delete the duplicated last element
        delete _ownedTokens[msg.sender][lastIndex];
        //delete old tokenId index
        delete ownedTokensIndex[tokenId];
        
        balances[msg.sender] -= 1;

        totalStaked -= 1;

        emit NFTUnstaked(tokenOwner, tokenId, block.timestamp);
        
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns(uint256){
        require(index < balances[owner], "owner index out of bounds");
        return _ownedTokens[owner][index];
    }
    
    
    function setStakerOpen(bool isStakerOpen_) external onlyManager(msg.sender){
        isStakerOpen = isStakerOpen_;
    }

    function setSingleStaker(bool isSingleStaker_) external onlyManager(msg.sender){
        isSingleStaker = isSingleStaker_;
    }

    function setBuildingContract(address bld_) external onlyManager(msg.sender) {
        building = AncientMiner(bld_);
    }

    function setManagerStatus(address manager_, bool status) external onlyOwner {
        managers[manager_] = status;
    }


    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
      require(from == address(0x0), "Cannot send nfts to Vault directly");
      return IERC721Receiver.onERC721Received.selector;
    }
    
}
