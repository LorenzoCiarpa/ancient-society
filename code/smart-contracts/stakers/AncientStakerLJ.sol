// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AncientLumberjack.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";





contract AncientStakerLJ is Ownable, IERC721Receiver {

    bool public isStakerOpen;
    uint256 public totalStaked;
    mapping(address => bool) public ljIsStakedForAddress;
    mapping(address => uint256) public ljForAddress;

    uint256 public idxStake;
    uint256 public idxUnstake;

    struct Stake {
        bool isStaked;
        uint48 timestamp;
        address owner;
    }

    event NFTStaked(uint256 indexed idxStake, address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(uint256 indexed idxUnstake, address owner, uint256 tokenId, uint256 value);

    AncientLumberjack public lumberjack;

    mapping(uint256 => Stake) public ljStaked;


    constructor(address lj) Ownable (msg.sender){
        
        lumberjack = AncientLumberjack(lj);
    }



    function stake(uint256 tokenId) external {
        require(isStakerOpen, "staker not open");
        require(lumberjack.ownerOf(tokenId) == msg.sender, "not your token");
        require(lumberjack.getApproved(tokenId) == address(this), "contract-not-allowed");
        require(ljIsStakedForAddress[msg.sender] == false, "max stake"); 
        require(ljStaked[tokenId].isStaked == false, 'already staked');


        lumberjack.transferFrom(msg.sender, address(this), tokenId);
        emit NFTStaked(idxStake, msg.sender, tokenId, block.timestamp);

        idxStake += 1;

        ljStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        ljIsStakedForAddress[msg.sender] = true;
        ljForAddress[msg.sender] = tokenId;
        
        totalStaked++;

    }

    function unstake(uint256 tokenId) external {
        require(ljStaked[tokenId].owner == msg.sender, "not owner");
        require(ljStaked[tokenId].isStaked == true, "not staked");
        require(ljIsStakedForAddress[msg.sender] == true, "not staker"); 

        lumberjack.transferFrom(address(this), msg.sender, tokenId);
        emit NFTUnstaked(idxUnstake, msg.sender, tokenId, block.timestamp);

        idxUnstake += 1;

        ljStaked[tokenId].isStaked = false;
        ljStaked[tokenId].timestamp = uint48(block.timestamp);

        ljIsStakedForAddress[msg.sender] = false;
        ljForAddress[msg.sender] = 5000;
        
        totalStaked--;
        
    }

    function setStakerOpen(bool isStakerOpen_) external onlyOwner{
        isStakerOpen = isStakerOpen_;
    }

    function setLumberjackContract(address lj) external onlyOwner {
        lumberjack = AncientLumberjack(lj);
    }

    function getLjIsStaked(uint256 tokenId) external view returns(bool){
        return ljStaked[tokenId].isStaked;
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
