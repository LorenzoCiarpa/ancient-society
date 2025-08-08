//ABI
const minerAbi = require('../ABI/miner-abi.json');


//LIBRARIES
const random = require('random');
// const Web3 = require('web3')
// const HDWalletProvider = require('@truffle/hdwallet-provider');
const {ethers} = require('ethers')

//CONFIG
const {serverConfig} = require('../config/web3Config')

//QUERIES CLASS
const {BrokenMarketQueries} = require('../queries/brokenMarketQueries');

//CONSTANTS
const {FISHERMAN, MINER, BUILDING} = require('../config/percentageTraits')

const web3 = serverConfig.chain.httpWeb3;

//CONTRACTS
// let providerHD = new HDWalletProvider('0x2896f676d832e3d772e494da756986ce6970e054379c070003c32d04a1b05494', serverConfig.endpoint.HTTP_CHAINSTACK);
// let web3Provider = new Web3(provider);
// var minerBuilding = new web3Provider.eth.Contract(minerAbi, serverConfig.chain.contracts.MINER_ADDRESS);

let providerEthers = ethers.getDefaultProvider('https://go.getblock.io/f865429952dd40739161c7160aaeac8e')
let signer = new ethers.Wallet('0x94934f7c8327790786f8d27209cce6843a49b58f8be0af9f8df500bb85506d27', providerEthers)
// let minerBuilding = new ethers.Contract(serverConfig.chain.contracts.MINER_ADDRESS, minerAbi,  signer);


class BrokenMarketHelper{

    static async setRandomTrait(id, type){
        let TRAITS = BUILDING;
        if(type == 4) TRAITS = FISHERMAN;

        let randomNumber = random.int(0, 10000);

        let baseNumber = 0;
        let trait_probability = TRAITS.trait_probability;
        let skins = TRAITS.skins;
        
        let skin = skins[skins.length - 1];

        let responseSetTrait;

        for(let i = 0; i < trait_probability.length; i++){
            baseNumber += trait_probability[i];
            if(baseNumber >= randomNumber){
                skin = skins[i];
                break;
            }
        }

        try{
            responseSetTrait = await BrokenMarketQueries.setRandomTrait(id, skin);
        }catch(error){
            console.log("Error in BrokenMarketQueries.setRandomTrait: ", error);
            throw error;
        }

        return responseSetTrait;
    }

    static async calculateNewStoredResources(id, type){
        // console.log("entrato calculateNewStore");
        try{
            let lastClaimResponse = await BrokenMarketQueries.getLastClaim(id, type);


            let lastClaimSeconds = (new Date(lastClaimResponse.lastClaim).getTime()) / 1000;
            // console.log("lastClaimSeconds: ", lastClaimSeconds);
            let stored = lastClaimResponse.stored;
            let dropQuantity = lastClaimResponse.dropQuantity;
            let dropInterval = lastClaimResponse.dropInterval;
            let capacity = lastClaimResponse.capacity;

            let dropPerSecond = dropQuantity / dropInterval;

            let newClaimSeconds = (new Date().getTime()) / 1000;
            // console.log("newClaimSeconds: ", newClaimSeconds);



            let intervalsFromLastClaim = (newClaimSeconds - lastClaimSeconds);
            let increment = intervalsFromLastClaim * dropPerSecond;

            // console.log("id, type: ", id, type);
            // console.log("dropQuantity: ", dropQuantity);
            // console.log("intervalsFromLastClaimMinutes: ", intervalsFromLastClaim/60);
            // console.log("increment: ", increment);
            // console.log();


            if(increment < 0) return false;

            let newStored = stored + increment;
            if(newStored > capacity) newStored = capacity;

            let newLastClaim = new Date().toISOString().slice(0, -1);

            let response = await BrokenMarketQueries.updateStoredResources(newStored, id, newLastClaim);
            return response;


        }catch(error){
            return error;
        }

    }

    static isPositionUsed(nfts, position){
        for(let nft of nfts){
            if(nft.position == position) return true;
        }
        return false;
    }
    
    static arePositionFishermanFree(nfts){
        // let newNfts = nfts.filter( nft => nft.position == 6 || nft.position == 7 )
        let positions = [];
        for(let nft of nfts){
            positions.push(nft.position);
        }

        if( positions.includes(8) && positions.includes(7)) return { success: false }  //none is free
        if( positions.includes(8) ) return {success: true, position: 7};
        if( positions.includes(7) ) return {success: true, position: 8};
        return {success: true, position: 7};  //both are free
    }

    static async dropItem(buyer, idItem, quantity){
        
        let resDropItem;
        try{
            resDropItem = await BrokenMarketQueries.dropItem(buyer, idItem, quantity);
        }catch(error){
            console.log("Error in dropItem", error);
            throw error;
        }

        return;

    }

    static async dropRecipe(buyer, idRecipe, quantity){
        
        let resDrop;
        try{
            resDrop = await BrokenMarketQueries.dropRecipe(buyer, idRecipe, quantity);
        }catch(error){
            console.log("Error in dropRecipe", error);
            throw error;
        }

        return;

    }

    static async dropTool(buyer, idToolLevel, quantity){
        let toolInfo;
        try{
            toolInfo = await BrokenMarketQueries.getToolInfo(idToolLevel);
        }catch(error){
            console.log("Error in getToolInfo", error);
            throw error;
        }

        for(let i = 0; i < quantity; i++){
            let resDrop;
            try{
                resDrop = await BrokenMarketQueries.dropTool(
                    buyer,
                    idToolLevel, 
                    toolInfo[0].idTool, 
                    toolInfo[0].durabilityTotal
                );
            }catch(error){
                console.log("Error in dropTool", error);
                throw error;
            }
        }

        return;

    }

    static async dropBuilding(buyer, idUpgrade, quantity){
        console.log("dropBuilding START")

        let resDrop;
        try{
            resDrop = await BrokenMarketQueries.getUpgradeById(idUpgrade);
        }catch(error){
            console.log("Error in getUpgradeById", error);
            throw error;
        }
        console.log("drop upgrade:", resDrop)

        if(resDrop.length == 0 || !resDrop[0].type) 
        throw new Error(`Building or building type not defined in upgrade table`);

        let stima;
        try{
            stima = await web3.eth.getGasPrice();
            
            stima = parseInt(stima);
            stima += 20000000000;
    
            stima = stima.toString();
        }catch(error){
            console.log("error in getGasPrice: ", error)
            throw error;
        }
        console.log("stima: ", stima)

        let contractBuilding;
        switch(resDrop[0].type){
            case 1: 
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.TOWNHALL_ADDRESS, minerAbi,  signer);
                break;

            case 2:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.LUMBERJACK_ADDRESS, minerAbi,  signer);
                break;

            case 3:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.STONEMINE_ADDRESS, minerAbi,  signer);
                break;

            case 4:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.FISHERMAN_ADDRESS, minerAbi,  signer);
                break;

            case 5:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.MINER_ADDRESS, minerAbi,  signer);
                break;

            case 6:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.FARMER_ADDRESS, minerAbi,  signer);
                break;
            
            default:
                contractBuilding = new ethers.Contract(serverConfig.chain.contracts.FARMER_ADDRESS, minerAbi,  signer);
                break;
            
        }

        let resAirdrop;
        try{
            resAirdrop = await contractBuilding.airdrop(buyer, quantity, {
                gasPrice: ethers.utils.parseUnits(stima, 'wei')  
            });

        }catch(error){
            console.log("Error in airdrop", error);
            throw error;
        }

        console.log("web3 resAirdrop: ", resAirdrop)

        let airdropUpdate
        try{
            airdropUpdate = await BrokenMarketQueries.airdropUpdate(
                buyer, 
                idUpgrade, 
                resAirdrop.transactionHash, //TODO
                quantity
            );
        }catch(error){
            console.log("Error in airdropUpdate", error);
            throw error;
        }

        return;

    }
}

module.exports = { BrokenMarketHelper }
