// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import "./VoucherStorage.sol";

contract Ancien is ERC20, EIP712, Ownable {

    bool public isMintOpen;
    bool public isBurnOpen;
    bool public isCleaning;

    address public signer;
    address public voucherAddress;
    uint256 public lastBlockCleaned;

    string public SIGNING_DOMAIN_NAME = "Ancien";
    string public SIGNING_DOMAIN_VERSION = "1";

    uint256 public idxChange;
    uint256 public idxBurn;

    VoucherStorage public voucherStorage;

    event VoucherMinted(uint256 indexed idxMint, uint256 id, address spender, bytes signature);
    event VoucherStorageChanged(uint256 indexed idxChange, address voucherAddress);
    event VoucherDestroyed(uint256 indexed idxDestroy, bytes signature);
    event TokenBurned(uint256 indexed idxBurn, address indexed _owner, uint256 quantity, uint256 blockNumber);

    constructor() ERC20("Ancien", "ANCIEN") EIP712(SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION) Ownable (msg.sender){
        isMintOpen = true;
        isBurnOpen = true;
    }

    function setVoucherStorage(address voucherAddress_) external onlyOwner{
        voucherStorage = VoucherStorage(voucherAddress_);
        voucherAddress = voucherAddress_;
        lastBlockCleaned = block.number;
        emit VoucherStorageChanged(idxChange, voucherAddress_);
        idxChange++;
    }

    function getChainId() public view returns(uint256){
        return block.chainid;
    }

    function check(uint256 id, address spender, uint256 tokens, uint256 blockNumber, bytes memory signature) public view returns(address){
        return _verify(id, spender, tokens, blockNumber, signature);
    }

    function _verify(uint256 id, address spender, uint256 tokens, uint256 blockNumber, bytes memory signature) internal view returns(address){
        bytes32 digest = _hash(id, spender, tokens, blockNumber);
        return ECDSA.recover(digest, signature);
    }

    function _hash(uint256 id, address spender, uint256 tokens, uint256 blockNumber) internal view returns(bytes32){
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("AncienStruct(uint256 id,address spender,uint256 tokens,uint256 blockNumber)"),
            id, 
            spender, 
            tokens, 
            blockNumber
        )));
    }

    function setMintOpen(bool isOpen) external onlyOwner{
        isMintOpen = isOpen;
    }

    function setBurnOpen(bool isBurn) external onlyOwner{
        isBurnOpen = isBurn;
    }

    function setCleaning(bool cleaning) external onlyOwner{
        isCleaning = cleaning;
    }

    function setSigner(address signer_) external onlyOwner{
        signer = signer_;
    }

    
    function destroyVoucher(uint256 id, address _owner, uint256 _amount, uint256 blockNumber, bytes memory signature) external {
        require(_owner == msg.sender, "different owner");
        require(check(id, _owner, _amount, blockNumber, signature) == signer, "Voucher Invalid");
        require(voucherStorage.getVoucher(signature) == false, "Voucher already used");
        voucherStorage.setVoucher(signature);
        
        emit VoucherDestroyed(id, signature);
    }

   
    function mint(uint256 id, address _owner, uint256 _amount, uint256 blockNumber, bytes memory signature) external {
        require(_owner == msg.sender, "different owner");
        require(isMintOpen && !isCleaning, "Mint not open");
        require(check(id, _owner, _amount, blockNumber, signature) == signer, "Voucher Invalid");
        require(voucherStorage.getVoucher(signature) == false, "Voucher already used");
        require(blockNumber > lastBlockCleaned, "Voucher is expired");

        voucherStorage.setVoucher(signature);

        uint256 _amountInDecimals = _amount * (10 ** 18);  
        _mint(_owner, _amountInDecimals);

        emit VoucherMinted(id, id, _owner, signature); 
        
    }

    function burn(address _owner, uint256 _amount) external {
        require(isBurnOpen, "Burn not open");
        require(_owner == msg.sender, "Different owner");

        uint256 _amountInDecimals = _amount * (10 ** 18);

        _burn(_owner, _amountInDecimals);

        emit TokenBurned(idxBurn, _owner, _amount, block.number);
        idxBurn++;
    }

}
