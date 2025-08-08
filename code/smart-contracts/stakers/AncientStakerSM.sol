// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AncientStonemine.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";





contract AncientStakerSM is Ownable, IERC721Receiver {

    bool public isStakerOpen;
    uint256 public totalStaked;
    mapping(address => bool) public smIsStakedForAddress;
    mapping(address => uint256) public smForAddress;

    uint256 public idxStake;
    uint256 public idxUnstake;

    struct Stake {
        bool isStaked;  
        uint48 timestamp;
        address owner;
    }

    event NFTStaked(uint256 indexed idxStake, address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(uint256 indexed idxUnstake, address owner, uint256 tokenId, uint256 value);

    AncientStonemine public stonemine;

    
    mapping(uint256 => Stake) public smStaked;


    constructor(address sm) Ownable (msg.sender){
        
        stonemine = AncientStonemine(sm);
    }



    function stake(uint256 tokenId) external {
        require(isStakerOpen, "staker not open");
        require(stonemine.ownerOf(tokenId) == msg.sender, "not your token");
        require(stonemine.getApproved(tokenId) == address(this), "contract-not-allowed");
        require(smIsStakedForAddress[msg.sender] == false, "max stake");
        require(smStaked[tokenId].isStaked == false, 'already staked');


        stonemine.transferFrom(msg.sender, address(this), tokenId);
        emit NFTStaked(idxStake, msg.sender, tokenId, block.timestamp);

        idxStake += 1;

        smStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        smIsStakedForAddress[msg.sender] = true;
        smForAddress[msg.sender] = tokenId;
        
        totalStaked++;

    }

    function unstake(uint256 tokenId) external {
        require(smStaked[tokenId].owner == msg.sender, "not owner");
        require(smStaked[tokenId].isStaked == true, "not staked");
        require(smIsStakedForAddress[msg.sender] == true, "not staker");

        stonemine.transferFrom(address(this), msg.sender, tokenId);
        emit NFTUnstaked(idxUnstake, msg.sender, tokenId, block.timestamp);

        idxUnstake += 1;

        smStaked[tokenId].isStaked = false;
        smStaked[tokenId].timestamp = uint48(block.timestamp);

        smIsStakedForAddress[msg.sender] = false;
        smForAddress[msg.sender] = 5000;
        
        totalStaked--;
        
    }

    function setStakerOpen(bool isStakerOpen_) external onlyOwner{
        isStakerOpen = isStakerOpen_;
    }

    function setStonemineContract(address sm) external onlyOwner {
        stonemine = AncientStonemine(sm);
    }

    function getSmIsStaked(uint256 tokenId) external view returns(bool){
        return smStaked[tokenId].isStaked;
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
