const logger = require('../logging/logger');
// const { MerkleTree } = require('merkletreejs');
// const keccak256 = require('keccak256');
// const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { ethers } = require('ethers');

const {Utils} = require("../utils/utils");
const {serverConfig} = require('../config/serverConfig')

const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

//ONLY READ

const web3 = serverConfig.chain.httpWeb3;
const {VoucherReferalQueries, VoucherContractQueries, VoucherFarmerQueries} = require('../queries/voucherQueries');



const SIGNING_DOMAIN_VERSION = "1";
const SIGNING_DOMAIN_NAME_FARMER = "Ancien";
const SIGNING_DOMAIN_NAME_LAND = "AncientStakerLand";
const SIGNING_DOMAIN_NAME_REFERAL = "AncientStakerLand";

class VoucherService{
    constructor() {}

    static async createLandVoucher(address, idContract, creation, expireTime, fee){
        let response;
        let recordId;
        let blockNumber;
        let contractInfo;
        let signResponse;
        let signature;
        let voucher;

        try {
            response = await VoucherContractQueries.createVoucher();
        } catch (error) {
            logger.error(`Error in voucherService.createVoucher:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response createVoucher:${JSON.stringify(response)}`);

        //Check if response return affectedRows
        if(response.affectedRows != 1){
            throw "affectedRows not one";
        }


        recordId = response.insertId;

        try {
            blockNumber = await web3.eth.getBlockNumber(); 
        } catch (error) {
            logger.error(`Error in w3b.eth.getBlockNumber:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response getBlockNumber: ${JSON.stringify(blockNumber)}`);

        contractInfo = {
            contractAddress: serverConfig.chain.contracts.STAKER_LAND_ADDRESS.trim(),
            signing_domain_name: SIGNING_DOMAIN_NAME_LAND
        }

        logger.debug(`response getContractInfoGivenType: ${JSON.stringify(contractInfo)}`);
        try {
            signResponse = await SignerHelper.getSign(
                contractInfo.contractAddress,
                process.env.CHAIN_ID,  //TODO set in testing
                idContract,
                address,
                blockNumber,
                creation,
                expireTime,
                fee,
                contractInfo.signing_domain_name);
        
        } catch (error) {
            logger.error(`Error in ContractsModel.SignerHelper.getSign:${Utils.printErrorLog(error)}`);
            throw error;
        }
        signature = signResponse.signature;


        logger.debug(`signature:${signature}`);

        voucher = {
            id: recordId,
            idContract: idContract,
            owner: address,
            blockNumber: blockNumber,
            creation: creation,
            expireTime: expireTime,
            fee: fee,
            signature: signature
        };

        logger.debug(`voucher:${JSON.stringify(voucher)}`);

        //updateVoucherCreated
        try {
            response = await VoucherContractQueries.updateCreatedVoucher(voucher);
        } catch (error) {
            logger.error(`Error in voucherService.updateCreatedVoucher:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response updateCreatedVoucher:${JSON.stringify(response)}`);

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

    static async createFarmerVoucher(address){
        let response;
        let recordId;
        let blockNumber;
        let contractInfo;
        let signResponse;
        let signature;
        let voucher;
        let quantity;

        try {
            quantity = await VoucherFarmerQueries.getTokensAllowed(address);
        } catch (error) {
            logger.error(`Error in voucherService.createVoucher:${Utils.printErrorLog(error)}`);
            throw error;
        }

        if(!quantity || quantity?.length == 0){
            logger.error(`quantity not valued: ${JSON.stringify(quantity)}`);
            throw new Error(`quantity not valued`);
        }

        quantity = quantity[0].quantity;

        try {
            response = await VoucherFarmerQueries.createVoucher();
        } catch (error) {
            logger.error(`Error in voucherService.createVoucher:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response createVoucher:${JSON.stringify(response)}`);

        //Check if response return affectedRows
        if(response.affectedRows != 1){
            throw "affectedRows not one";
        }


        recordId = response.insertId;

        try {
            blockNumber = await web3.eth.getBlockNumber(); 
        } catch (error) {
            logger.error(`Error in w3b.eth.getBlockNumber:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response getBlockNumber: ${JSON.stringify(blockNumber)}`);

        contractInfo = {
            contractAddress: serverConfig.chain.contracts.FARMER_ADDRESS.trim(),
            signing_domain_name: SIGNING_DOMAIN_NAME_FARMER
        }

        logger.debug(`response getContractInfoGivenType: ${JSON.stringify(contractInfo)}`);
        console.log(`response RESTO#####: `, recordId, address, quantity, blockNumber);
        try {
            signResponse = await SignerHelper.getSignFarmer(
                contractInfo.contractAddress,
                process.env.CHAIN_ID,  //TODO set in testing
                recordId,
                address,
                quantity,
                blockNumber,
                contractInfo.signing_domain_name);
        
        } catch (error) {
            logger.error(`Error in ContractsModel.SignerHelper.getSign:${Utils.printErrorLog(error)}`);
            throw error;
        }
        signature = signResponse.signature;


        logger.debug(`signature:${signature}`);

        voucher = {
            id: recordId,
            owner: address,
            quantity: quantity,
            blockNumber: blockNumber,
            signature: signature
        };

        logger.debug(`voucher:${JSON.stringify(voucher)}`);

        //updateVoucherCreated
        try {
            response = await VoucherFarmerQueries.updateCreatedVoucher(voucher);
        } catch (error) {
            logger.error(`Error in voucherService.updateCreatedVoucher:${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`response updateCreatedVoucher:${JSON.stringify(response)}`);

        let responseVoucher = {
            id: recordId,
            owner: address,
            quantity: quantity,
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
        logger.info(`createSignature start`);
        const obj =  {
            id,
            spender,
            blockNumber,
            creation,
            expireTime,
            fee
        };
        logger.debug(`object: ${JSON.stringify(obj)}`);

        let domain = await this.signingDomain(signing_domain_name);
        logger.debug(`domain:${JSON.stringify(domain)}`);
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
        logger.debug(`_signTypedData:${signature}`);
        logger.info(`createSignature end`);
        return {
            obj,
            signature
        }
    }

    async createSignatureFarmer(id, spender, tokens, blockNumber, signing_domain_name){
        logger.info(`createSignatureFarmer start`);
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
        logger.info(`createSignatureFarmer end`);
        return {
            obj,
            signature
        }
    }

    static async getSignFarmer(contractAddress, chainId, recordId, spender, tokens, blockNumber, signing_domain_name){
        logger.info(`getSignFarmer start`);
        console.log("input: ", contractAddress, chainId, recordId, spender, tokens, blockNumber, signing_domain_name)
        let signer = new ethers.Wallet(serverConfig.PRIVATE_KEY_SIGNER);
        logger.debug(`signer: ${JSON.stringify(signer)}`);
        let lm = new SignerHelper(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignatureFarmer(recordId, spender, tokens, blockNumber, signing_domain_name);
        } catch (error) {
            logger.error(`Error in createSignature:${Utils.printErrorLog(error)}`);
            return error;
        }
        logger.info(`getSignFarmer end`);

        return voucher;
    }

    static async getSign(contractAddress, chainId, idContract, spender, blockNumber, creation, expireTime, fee, signing_domain_name){
        logger.info(`getSign start`);
        let signer = new ethers.Wallet(serverConfig.PRIVATE_KEY_SIGNER);
        logger.debug(`signer: ${JSON.stringify(signer)}`);
        let lm = new SignerHelper(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignature(idContract, spender, blockNumber, creation, expireTime, fee, signing_domain_name);
        } catch (error) {
            logger.error(`Error in createSignature:${Utils.printErrorLog(error)}`);
            return error;
        }
        logger.info(`getSign end`);

        return voucher;
    }

    async createSignatureReferal(id, spender, blockNumber, quantity, signing_domain_name){
        logger.info(`createSignatureReferal start`);
        const obj =  {
            id,
            spender,
            blockNumber,
            quantity
        };
        logger.debug(`object: ${JSON.stringify(obj)}`);

        let domain = await this.signingDomain(signing_domain_name);
        logger.debug(`domain:${JSON.stringify(domain)}`);
        const types = {
            AncienStruct: [
                {name: "id", type: "uint256"},
                {name: "spender", type: "address"},
                {name: "blockNumber", type: "uint256"},
                {name: "quantity", type: "uint256"},
                
            ]
        };

        const signature = await this.signer._signTypedData(domain, types, obj);
        logger.debug(`_signTypedData:${signature}`);
        logger.info(`createSignatureReferal end`);
        return {
            obj,
            signature
        }
    }

    static async getSignReferal(contractAddress, chainId, id, spender, blockNumber, quantity, signing_domain_name){
        logger.info(`getSignReferal start`);
        let signer = new ethers.Wallet(serverConfig.PRIVATE_KEY_SIGNER);
        logger.debug(`signer: ${JSON.stringify(signer)}`);
        let lm = new SignerHelper(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignatureReferal(id, spender, blockNumber, quantity, signing_domain_name);
        } catch (error) {
            logger.error(`Error in createSignatureReferal:${Utils.printErrorLog(error)}`);
            return error;
        }
        logger.info(`getSignReferal end`);

        return voucher;
    }


}

module.exports = {VoucherService, SignerHelper}