//Utilities
const logger = require('../logging/logger');
const {Utils} = require("../utils/utils");

//WEB3
const {serverConfig} = require('../config/serverConfig')
const Web3 = require('web3');

//ABI
const marketplaceAbi = require('../ABI/omega-marketplace-abi.json')

//OPTIONS

//CONTRACTS
// const marketplace = new serverConfig.chain.wssWeb3.eth.Contract(marketplaceAbi, serverConfig.chain.contracts.ANCIENT_OMEGA_MARKETPLACE);
const web3wss = new Web3(new Web3.providers.WebsocketProvider("wss://go.getblock.io/e37352f1f62141fa8cf310202d0fc127", serverConfig.options))
const web3wssEth = new Web3(new Web3.providers.WebsocketProvider("wss://go.getblock.io/7457b34bb4da44cd991a0bbed58533c7", serverConfig.options))

const marketplace = new web3wss.eth.Contract(marketplaceAbi, '0xD336af2de2832d0320C47C91C5F8bC46344941F5');
const marketplaceEth = new web3wssEth.eth.Contract(marketplaceAbi, '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA');


class ServerHelper{
    static async getOraclePrice(oracleAddress, priceUsd, chainId){
        let market;
        if(chainId == 1){
            market = marketplaceEth;
        }else if(chainId == 137){
            market = marketplace;
        }
        let singleUsd;
        try{
            singleUsd = await market.methods.getLatestPrice(oracleAddress).call();
        }catch(error){
            logger.error(`error in getLatestPrice: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        let finalPrice;
        try{
            finalPrice = await market.methods.conversionCurrency(singleUsd, priceUsd).call();
        }catch(error){
            logger.error(`error in conversionCurrency: ${Utils.printErrorLog(error)}`)
        }

        logger.debug(`Oracle price: ${serverConfig.chain.httpWeb3.utils.fromWei(finalPrice, 'ether')}`);
        return finalPrice;
    }

    static async getNonOraclePrice(){
        // let singleUsd;
        // try{
        //     singleUsd = await marketplace.methods.getLatestPrice(oracleAddress).call();
        // }catch{
        //     logger.error(`error in getLatestPrice: ${Utils.printErrorLog(error)}`)
        // }

        // let finalPrice;
        // try{
        //     finalPrice = await marketplace.methods.conversionCurrency(singleUsd, priceUsd).call();
        // }catch{
        //     logger.error(`error in conversionCurrency: ${Utils.printErrorLog(error)}`)
        // }

        // return finalPrice;
    }
}

module.exports = {
    ServerHelper
}