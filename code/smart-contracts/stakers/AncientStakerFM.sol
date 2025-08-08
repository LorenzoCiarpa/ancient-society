// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AncientFisherman.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";





contract AncientStakerFM is Ownable, IERC721Receiver {

    bool public isStakerOpen = true;
    uint256 public totalStaked;
    mapping(address => bool) public fmIsStakedForAddress;
    mapping(address => uint256) public fmForAddress;

    uint256 public idxStake;
    uint256 public idxUnstake;

    struct Stake {
        bool isStaked;
        uint48 timestamp;
        address owner;
    }

    event NFTStaked(uint256 indexed idxStake, address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(uint256 indexed idxUnstake, address owner, uint256 tokenId, uint256 value);

    AncientFisherman public fisherman;

    
    mapping(uint256 => Stake) public fmStaked;


    constructor(address fm) Ownable (msg.sender){
        
        fisherman = AncientFisherman(fm);
    }



    function stake(uint256 tokenId) external {
        require(isStakerOpen, "staker not open");
        require(fisherman.ownerOf(tokenId) == msg.sender, "not your token");
        require(fisherman.getApproved(tokenId) == address(this), "contract-not-allowed");
        require(fmIsStakedForAddress[msg.sender] == false, "max stake");
        require(fmStaked[tokenId].isStaked == false, 'already staked');


        fisherman.transferFrom(msg.sender, address(this), tokenId);
        emit NFTStaked(idxStake, msg.sender, tokenId, block.timestamp);

        idxStake += 1;

        fmStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        fmIsStakedForAddress[msg.sender] = true;
        fmForAddress[msg.sender] = tokenId;
        
        totalStaked++;

    }

    function unstake(uint256 tokenId) external {
        require(fmStaked[tokenId].owner == msg.sender, "not owner");
        require(fmStaked[tokenId].isStaked == true, "not staked");
        require(fmIsStakedForAddress[msg.sender] == true, "not staker");  

        fisherman.transferFrom(address(this), msg.sender, tokenId);
        emit NFTUnstaked(idxUnstake, msg.sender, tokenId, block.timestamp);

        idxUnstake += 1;

        fmStaked[tokenId].isStaked = false;
        fmStaked[tokenId].timestamp = uint48(block.timestamp);

        fmIsStakedForAddress[msg.sender] = false;
        fmForAddress[msg.sender] = 5000;
        
        totalStaked--;
        
    }

    function setStakerOpen(bool isStakerOpen_) external onlyOwner{
        isStakerOpen = isStakerOpen_;
    }

    function setFishermanContract(address fm) external onlyOwner {
        fisherman = AncientFisherman(fm);
    }

    function getFmIsStaked(uint256 tokenId) external view returns(bool){
        return fmStaked[tokenId].isStaked;
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
