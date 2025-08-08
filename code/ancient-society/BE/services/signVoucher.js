
const Web3 = require('web3');
const { ethers } = require('ethers');

const {Utils} = require("../utils/utils");

const options = {

    // timeout: 30000,

    clientConfig: {
        // Useful if requests are large

        //maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        //maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

//ONLY READ

//HTTP
const web3http = new Web3(new Web3.providers.HttpProvider(''));

//WSS
// const web3wss = new Web3(new Web3.providers.WebsocketProvider("4", options))

const SIGNING_DOMAIN_VERSION = "1";
const SIGNING_DOMAIN_NAME_LAND = "AncientStakerLand";
const SIGNING_DOMAIN_NAME_ANCIEN = "Ancien";

const SIGNER_PRIVATE_KEY = "";
const CHAIN_ID = 80001;
const BLOCKNUMBER = 54002929;
const CONTRACT_ADDRESS = "0x16D88Db49b997590718f76e67AD320298bB7BCDb";

class VoucherService{
    constructor() {}

    static async createLandVoucher(address, idContract, creation, expireTime, fee){
        let recordId;
        let blockNumber;
        let contractInfo;
        let signResponse;
        let signature;

        recordId = 0;

        blockNumber = BLOCKNUMBER;

        contractInfo = {
            contractAddress: CONTRACT_ADDRESS,
            signing_domain_name: SIGNING_DOMAIN_NAME_LAND
        }

        
        try {
            signResponse = await SignerHelper.getSign(
                contractInfo.contractAddress,
                CHAIN_ID,  //TODO set in testing
                idContract,
                address,
                blockNumber,
                creation,
                expireTime,
                fee,
                contractInfo.signing_domain_name);
        
        } catch (error) {
            throw error;
        }
        signature = signResponse.signature;





        //updateVoucherCreated
        

        let responseVoucher = {
            idContract: idContract,
            owner: address,
            blockNumber: blockNumber,
            creation: creation,
            expireTime: expireTime,
            fee: fee,
            signature: signature
        };

        return responseVoucher;
    }

    static async createAncienVoucher(address, id, amount){
        let blockNumber;
        let contractInfo;
        let signResponse;
        let signature;


        blockNumber = BLOCKNUMBER;

        contractInfo = {
            contractAddress: CONTRACT_ADDRESS,
            signing_domain_name: SIGNING_DOMAIN_NAME_ANCIEN
        }

        try {
            signResponse = await SignerHelperAncien.getSign(
                contractInfo.contractAddress,
                CHAIN_ID,  //TODO set in testing (chainId)
                id, // RECORD ID
                address,
                amount,
                blockNumber,
                contractInfo.signing_domain_name);
        
        } catch (error) {
            console.log(error)
            throw error;
        }
        signature = signResponse.signature;





        //updateVoucherCreated
        

        let responseVoucher = {
            id: id,
            owner: address,
            tokens: amount,
            blockNumber: blockNumber,
            signature: signature
        };

        return responseVoucher;
    }


}

class SignerHelper{
    constructor(contractAddress, chainId, signer) {
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.signer = signer;
    }

    async signingDomain(signing_domain_name){
        if(this.domain != null){
            return this.domain;
        }
        this.domain = {
            name: signing_domain_name,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: this.contractAddress,
            chainId: this.chainId
        };
        return this.domain;
    }

    async createSignature(id, spender, blockNumber, creation, expireTime, fee, signing_domain_name){
        
        const obj =  {
            id,
            spender,
            blockNumber,
            creation,
            expireTime,
            fee
        };

        let domain = await this.signingDomain(signing_domain_name);
        const types = {
            AncienStruct: [
                {name: "id", type: "uint256"},
                {name: "spender", type: "address"},
                {name: "blockNumber", type: "uint256"},
                {name: "creation", type: "bool"},
                {name: "expireTime", type: "uint48"},
                {name: "fee", type: "uint16"}
            ]
        };

        const signature = await this.signer._signTypedData(domain, types, obj);
        return {
            obj,
            signature
        }
    }

    static async getSign(contractAddress, chainId, idContract, spender, blockNumber, creation, expireTime, fee, signing_domain_name){
        
        let signer = new ethers.Wallet(SIGNER_PRIVATE_KEY);
        
        let lm = new SignerHelper(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignature(idContract, spender, blockNumber, creation, expireTime, fee, signing_domain_name);
        } catch (error) {
            return error;
        }

        return voucher;
    }


}

class SignerHelperAncien{
    constructor(contractAddress, chainId, signer){
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.signer = signer;
    }

    async createSignature(id, spender, tokens, blockNumber, signing_domain_name){
        
        const obj =  {
            id,
            spender,
            tokens,
            blockNumber
        };

        let domain = await this.signingDomain(signing_domain_name);
        const types = {
            AncienStruct: [
                {name: "id", type: "uint256"},
                {name: "spender", type: "address"},
                {name: "tokens", type: "uint256"},
                {name: "blockNumber", type: "uint256"}
            ]
        };

        const signature = await this.signer._signTypedData(domain, types, obj);
        return {
            obj,
            signature
        }
    }

    async signingDomain(signing_domain_name){
        if(this.domain != null){
            return this.domain;
        }
        this.domain = {
            name: signing_domain_name,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: this.contractAddress,
            chainId: this.chainId
        };
        return this.domain;
    }

    static async getSign(contractAddress, chainId, recordId, spender, tokens, blockNumber, signing_domain_name){

        let signer = new ethers.Wallet(SIGNER_PRIVATE_KEY);
        let lm = new SignerHelperAncien(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignature(recordId, spender, tokens, blockNumber, signing_domain_name);
        } catch (error) {
            return error;
        }

        return voucher;
    }

    static getContractInfoGivenType(type){
        switch(type){
            case 1: {
                return {
                    contractAddress: contractAncien,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_ANCIEN
                };
            }
            
            case 2: {
                return {
                    contractAddress: contractWood,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_WOOD
                };
            }

            case 3: {
                return {
                    contractAddress: contractStone,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_STONE
                };
            }

            case 137: {
                return {
                    contractAddress: contractMaticReward,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_MATIC_REWARD
                };
            }

            default:
                return null;
        }
    }

}

// module.exports = {VoucherService, SignerHelper}
async function getVoucherTest(){
    res = await VoucherService.createLandVoucher(
        "0x26881c56f7791e8f36cCF0A337CA2c53f0Ae10c8",
        1100, //idContract
        false,
        0, //1739388400
        0 //10
    )
    console.log(res)
    return res
    
}

async function getVoucherAncienTest(){
    res = await VoucherService.createAncienVoucher(
        "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
        0,
        100
    )
    console.log(res)
    return res
    
}

// getVoucherAncienTest()

async function testWeb3(){
    let blockNumber;
    try {
        blockNumber = await web3wss.eth.getBlockNumber(); 
    } catch (error) {
        console.log("error: ", error)
    }

    console.log(blockNumber)
    return blockNumber
    
}

getVoucherTest()