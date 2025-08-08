// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import ".//AncientTownhall.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";





contract AncientStakerTH is Ownable, IERC721Receiver {

    bool public isStakerOpen;
    uint256 public totalStaked;
    mapping(address => bool) public thIsStakedForAddress;
    mapping(address => uint256) public thForAddress;

    uint256 public idxStake;
    uint256 public idxUnstake;

    struct Stake {
        bool isStaked;
        uint48 timestamp;
        address owner;
    }

    event NFTStaked(uint256 indexed idxStake, address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(uint256 indexed idxUnstake, address owner, uint256 tokenId, uint256 value);

    AncientTownhall public townhall;

    
    mapping(uint256 => Stake) public thStaked;


    constructor(address th) Ownable (msg.sender){
        
        townhall = AncientTownhall(th);
    }



    function stake(uint256 tokenId) external {
        require(isStakerOpen, "staker not open");
        require(townhall.ownerOf(tokenId) == msg.sender, "not your token");
        require(townhall.getApproved(tokenId) == address(this), "contract-not-allowed");
        require(thIsStakedForAddress[msg.sender] == false, "max stake");
        require(thStaked[tokenId].isStaked == false, 'already staked');


        townhall.transferFrom(msg.sender, address(this), tokenId);
        emit NFTStaked(idxStake, msg.sender, tokenId, block.timestamp);

        idxStake += 1;

        thStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        thIsStakedForAddress[msg.sender] = true;
        thForAddress[msg.sender] = tokenId;
        
        totalStaked++;

    }

    function unstake(uint256 tokenId) external {
        require(thStaked[tokenId].owner == msg.sender, "not owner");
        require(thStaked[tokenId].isStaked == true, "not staked");
        require(thIsStakedForAddress[msg.sender] == true, "not staker");  

        townhall.transferFrom(address(this), msg.sender, tokenId);
        emit NFTUnstaked(idxUnstake, msg.sender, tokenId, block.timestamp);

        idxUnstake += 1;

        thStaked[tokenId].isStaked = false;
        thStaked[tokenId].timestamp = uint48(block.timestamp);

        thIsStakedForAddress[msg.sender] = false;
        thForAddress[msg.sender] = 5000;
        
        totalStaked--;
        
    }

    function setStakerOpen(bool isStakerOpen_) external onlyOwner{
        isStakerOpen = isStakerOpen_;
    }

    function setTownhallContract(address th) external onlyOwner {
        townhall = AncientTownhall(th);
    }

    function getThIsStaked(uint256 tokenId) external view returns(bool){
        return thStaked[tokenId].isStaked;
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
