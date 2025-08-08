// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import "./AncientLand.sol";
import "./VoucherStorageLand.sol";

//TODO controlla se va bene uint256 per timestamp

contract AncientStakerLand is Ownable, EIP712, IERC721Receiver {

    string public constant SIGNING_DOMAIN_NAME = "AncientStakerLand";
    string public constant SIGNING_DOMAIN_VERSION = "1";

    struct Stake {
        bool isStaked;
        uint48 timestamp;
        address owner;
    }

    struct ContractLand {
        uint256 idLand;  //vedi con problemi di oveerflow nel caso in cui viene passato un uint256 se va bene uint16 o no
        address owner;
        uint48 expireTime;
        uint16 fee;
        bool active; //needed ??(per history)
    }

    bool public isStakerOpen;
    address public manager;

    uint256 public totalStaked;
    uint256 public lastBlockCleaned;
    //MAPPING FOR STAKING BY ADDRESS
    mapping(address => bool) public isStakedForAddress;
    mapping(address => uint256) public tokenForAddress;
    //MAPPING FOR STAKING BY tokenId
    mapping(uint256 => Stake) public tokenStaked;
    //MAPPING FOR CONTRACT BY address
    mapping(address => uint256) public createdContract;
    //MAPPING FOR CONTRACT BY tokenId
    mapping(uint256 => ContractLand) public activeContract;
    mapping(uint256 => ContractLand) public historyContract;

    AncientLand public building;
    VoucherStorageLand public voucherStorage;

    event NFTStaked(address indexed owner, uint256 indexed tokenId, uint256 value);
    event NFTUnstaked(address indexed owner, uint256 indexed tokenId, uint256 value);

    event ContractCreated(address indexed owner, uint256 indexed idContract, bytes indexed signature);
    event ContractDeleted(address indexed owner, uint256 indexed idContract, bytes indexed signature);

    event VoucherDestroyed(address indexed owner, uint256 indexed idContract, bytes indexed signature);

    constructor() EIP712(SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION) Ownable (msg.sender){
        building = AncientLand(0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb);
        manager = 0x26881c56f7791e8f36cCF0A337CA2c53f0Ae10c8;
        voucherStorage = VoucherStorageLand(0x57F2994222926B688c7eBc352fDF15D538a6D6a4);
        isStakerOpen = true;
    }

    function check(uint256 id, address spender, uint256 blockNumber, bool creation, uint48 expireTime, uint16 fee, bytes memory signature) public view returns(address){
        return _verify(id, spender, blockNumber, creation, expireTime, fee, signature);
    }

    function _verify(uint256 id, address spender, uint256 blockNumber, bool creation, uint48 expireTime, uint16 fee, bytes memory signature) internal view returns(address){
        bytes32 digest = _hash(id, spender, blockNumber, creation, expireTime, fee);
        return ECDSA.recover(digest, signature);
    }

    function _hash(uint256 id, address spender, uint256 blockNumber, bool creation, uint48 expireTime, uint16 fee) internal view returns(bytes32){
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("AncienStruct(uint256 id,address spender,uint256 blockNumber,bool creation,uint48 expireTime,uint16 fee)"),
            id, 
            spender,
            blockNumber,
            creation,
            expireTime,
            fee
        )));
    }

    function stake(uint256 tokenId) external {
        require(isStakerOpen, "staker not open");
        require(building.ownerOf(tokenId) == msg.sender, "not your token");
        require(building.getApproved(tokenId) == address(this), "contract-not-allowed");
        require(isStakedForAddress[msg.sender] == false, "max stake");
        require(tokenStaked[tokenId].isStaked == false, 'already staked');


        building.transferFrom(msg.sender, address(this), tokenId);
        

        tokenStaked[tokenId] = Stake({
            owner: msg.sender,
            isStaked: true,
            timestamp: uint48(block.timestamp)
        });

        isStakedForAddress[msg.sender] = true;
        tokenForAddress[msg.sender] = tokenId;
        
        totalStaked++;

        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }

    function unstake(uint256 tokenId) external {
        address tokenOwner = tokenStaked[tokenId].owner;

        require(tokenStaked[tokenId].owner == msg.sender || msg.sender == manager, "not owner"); //Added possibility to unstake
        require(tokenStaked[tokenId].isStaked == true, "not staked");
        require(isStakedForAddress[tokenOwner] == true, "not staker");

        if(msg.sender != manager){  //if manager, force unstake also with contract active
            require(activeContract[createdContract[msg.sender]].expireTime < uint48(block.timestamp), "contract still active");
        }
        
        //should reset activeContract[createdContract[msg.sender]]
        
        building.transferFrom(address(this), tokenOwner, tokenId);

        tokenStaked[tokenId].isStaked = false;
        tokenStaked[tokenId].timestamp = uint48(block.timestamp);

        isStakedForAddress[tokenOwner] = false;
        tokenForAddress[tokenOwner] = 0;
        
        totalStaked--;

        emit NFTUnstaked(tokenOwner, tokenId, block.timestamp);
        
    }
    //If someone steal the contract to another one??
    function setContract(uint256 idContract, address _owner, uint256 blockNumber, bool creation, bytes memory signature, uint256 idLand, uint48 expireTime, uint16 fee) external {
        require(activeContract[createdContract[msg.sender]].expireTime < block.timestamp, "contract not expired");
        require(historyContract[idContract].owner == address(0), "idContract already used");

        require(expireTime > uint48(block.timestamp), "expireTime cannot be in the past");
        require(fee >= 0 && fee <= 100, "fee must be a percentage");
        require(creation == true, "creation must be true");

        require(voucherStorage.getVoucherCreation(signature) == false, "Voucher already used");
        require(check(idContract, _owner, blockNumber, creation, expireTime, fee, signature) == manager, "voucher invalid");

        require(tokenStaked[idLand].isStaked && tokenStaked[idLand].owner == msg.sender, "land not staked or not owner");

        ContractLand memory contractLand = ContractLand({
            owner: msg.sender,
            expireTime: expireTime,
            idLand: idLand,
            fee: fee,
            active: true
        });

        createdContract[msg.sender] = idContract;
        activeContract[idContract] = contractLand;
        historyContract[idContract] = contractLand;

        voucherStorage.setVoucher(signature, creation);

        emit ContractCreated(msg.sender, idContract, signature);
    }

    function deleteContract(uint256 idContract, address _owner, uint256 blockNumber, bool creation, bytes memory signature) external {
        require(_owner == msg.sender, "different owner");
        require(createdContract[_owner] == idContract, "not owner of this contract");

        require(voucherStorage.getVoucherDeletion(signature) == false, "Voucher already used");
        require(blockNumber > lastBlockCleaned, "Voucher is expired");
        require(creation == false, "creation must be false");

        require(check(idContract, _owner, blockNumber, creation, 0, 0, signature) == manager, "voucher invalid");


        createdContract[msg.sender] = 0;

        activeContract[idContract] = ContractLand({
            owner: address(0),
            expireTime: 0,
            idLand: 0,
            fee: 0,
            active: false
        });

        historyContract[idContract].active = false;

        voucherStorage.setVoucher(signature, creation);

        emit ContractDeleted(msg.sender, idContract, signature);
    }

    // function destroyVoucher(uint256 idContract, address _owner, uint256 blockNumber, bool creation, bytes memory signature) external {

    // }
    // function resetHistory()

    function setStakerOpen(bool isStakerOpen_) external onlyOwner{
        isStakerOpen = isStakerOpen_;
    }

    function setBuildingContract(address bld_) external onlyOwner {
        building = AncientLand(bld_);
    }

    function setManager(address manager_) external onlyOwner {
        manager = manager_;
    }

    function setVoucherStorage(address voucherAddress_) external onlyOwner{
        voucherStorage = VoucherStorageLand(voucherAddress_);
        lastBlockCleaned = block.number;
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
