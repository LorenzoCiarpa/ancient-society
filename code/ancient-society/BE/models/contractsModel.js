const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const Web3 = require('web3');
// const fs = require('fs');
const { ethers } = require('ethers');
const logger = require('../logging/logger');
const {Utils} = require("../utils/utils");
const {serverConfig} = require('../config/serverConfig')




let SIGNING_DOMAIN_VERSION = "1";

let SIGNING_DOMAIN_NAME_ANCIEN = "Ancien";
let SIGNING_DOMAIN_NAME_WOOD = "AncienWood";
let SIGNING_DOMAIN_NAME_STONE = "AncienStone";
let SIGNING_DOMAIN_NAME_MATIC_REWARD = "AncienMaticReward";

let contractAncien = serverConfig.chain.contracts.ANCIEN_ADDRESS;   
let contractWood = serverConfig.chain.contracts.WOOD_ADDRESS;
let contractStone = serverConfig.chain.contracts.STONE_ADDRESS;
let contractMaticReward = serverConfig.chain.contracts.MATIC_REWARD_ADDRESS || '0xa1490A2EbB6a5bBD218a8ED31104fdDB59D215d8'



const addresses = [
    "0x004CaD75155Af30B36B33358047604B8A9227f6c",
    "0x008Fea824b2eff9EEC88129953AF612e17d6e479",
    "0x009f40514AEa4a2A6bA6535acf156703ea4345A9",
    "0x26881c56f7791e8f36cCF0A337CA2c53f0Ae10c8",
];

class WhitelistService {

    constructor() {
        this.addresses = addresses;
        this.tree = this.createTree();
        this.root = this.generateWhitelistRoot(this.addresses);
    }

    buf2hex(x){
        return '0x' + x.toString('hex');
    }

    createTree(){
        let leaves = this.addresses.map(x => keccak256(x));
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        return tree;
    }

    generateWhitelistRoot(){
        let tree = this.createTree();
        let root = tree.getRoot();
    
        return this.buf2hex(root);
    }
    
    generateLeaf(address){
        return keccak256(address);
    }
    
    generateMerkleProof(address){
        let leaf = keccak256(address);
        let proof = this.tree.getProof(leaf).map(x => this.buf2hex(x.data));
        return proof;
    }

    isVerified(address){
        let merkleProof = this.generateMerkleProof(address);
        let leaf = this.generateLeaf(address);

        return this.tree.verify(merkleProof, leaf, this.root);
        
    }

    

}

class SignerHelper{
    constructor(contractAddress, chainId, signer){
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.signer = signer;
    }

    async createSignature(id, spender, tokens, blockNumber, signing_domain_name){
        logger.info(`createSignature start`);
        const obj =  {
            id,
            spender,
            tokens,
            blockNumber
        };
        logger.debug(`object: ${JSON.stringify(obj)}`);

        let domain = await this.signingDomain(signing_domain_name);
        logger.debug(`domain:${JSON.stringify(domain)}`);
        const types = {
            AncienStruct: [
                {name: "id", type: "uint256"},
                {name: "spender", type: "address"},
                {name: "tokens", type: "uint256"},
                {name: "blockNumber", type: "uint256"}
            ]
        };

        const signature = await this.signer._signTypedData(domain, types, obj);
        logger.debug(`_signTypedData:${signature}`);
        logger.info(`createSignature end`);
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
        logger.info(`getSign start`);
        let signer = new ethers.Wallet(serverConfig.PRIVATE_KEY_SIGNER);
        logger.debug(`signer: ${JSON.stringify(signer)}`);
        let lm = new SignerHelper(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignature(recordId, spender, tokens, blockNumber, signing_domain_name);
        } catch (error) {
            logger.error(`Error in lm.createSignature:${Utils.printErrorLog(error)}`);
            return error;
        }
        logger.info(`getSign end`);

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

class ContractService {
    constructor(){}

    getContractInfoGivenType(type){
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



module.exports = {WhitelistService, SignerHelper, ContractService}