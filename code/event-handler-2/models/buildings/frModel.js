const buildingModel = require('./buildingModel');
const TYPE = 6;
const {serverConfig} = require('../../config/web3Config')

let buildingService = new buildingModel.BuildingService();

class MintService {
    constructor(){}

    async mintBundleOnData(event){
        console.log("event Mint farmer: ", event);
        console.log("");
        console.log("");
        console.log("");
        // console.log("event 2 mintBundleOnDataReturnValues: ", event.returnValues);
        let player = event.returnValues.player;
        let tokenId = event.returnValues.tokenId;
        let upgradeInfo;
        let response;
        let responseTrait;
        
        try{
            upgradeInfo = await buildingService.getUpgradeBytypeAndLevel(TYPE, 1);
        }catch(error){
            console.log("error in getUpgradeBytypeAndLevel..: ", error);
            return;
        }

        if(upgradeInfo.length == 0){
            console.log("upgradeInfo doesn't exist: ");
            return;
        }
        console.log("upgrade: ", upgradeInfo)

        upgradeInfo = upgradeInfo[0];
	
        try{
            response = await buildingService.mintBuilding(
                player, 
                TYPE, //type
                1, //level
                tokenId,
                upgradeInfo.name,
                upgradeInfo.newDescription,
                upgradeInfo.newCapacity,
                upgradeInfo.newDropQuantity
            );
        }catch(error){
            console.log("error in mintBuilding..: ", error);
            return;
        }
        

        if(response.insertId == 0){
            console.log("duplicate mintBuilding: ", response);
            return;
            
        }

        console.log("response mintBuilding: ", response);

        try{
            responseTrait = await buildingService.setRandomTrait(response.insertId, TYPE);
        }catch(error){
            console.log("error in setRandomTraitInventory: ", error);
            return;
        }

        let pkBuilding = response.insertId;

        console.log("response setRandomTraitInventory: ", responseTrait);
        
        try{
            response = await buildingService.mintBasicHoe(
                player
            );
        }catch(error){
            console.log("error in mintBasicRod: ", error);
            return;
        }
        
        console.log("response mintBasicRod: ", response);

        let idBasicRod = response.insertId;

        try{
            response = await buildingService.addBasicTool(
                pkBuilding,
                idBasicRod
            )
        }catch(error){
            console.log("error in addBasicTool: ", error);
            return;
        }
        
        console.log("response addBasicTool: ", response);

        return;
        
    }

    async mintBundleOnChange(change){
        console.log("Change in mintBundleOnChange farmer: ", change);
    }

    async mintBundleOnError(error){
        console.log("Error in mintBundleOnError farmer: ", error);
    }

    async mintOnData(event){
        console.log("event Transfer farmer: ", event);
        console.log("");
        console.log("");
        console.log("");
        let from = event.returnValues.from;
        let to = event.returnValues.to;
        let tokenId = event.returnValues.tokenId;
        let user;
        let response;
        let bld;

        console.log(" tokenId: ", tokenId);
        console.log("from: ", from);
        console.log("to: ", to);

        if(from == serverConfig.chain.contracts.STAKER_FARMER_ADDRESS.trim() || to == serverConfig.chain.contracts.STAKER_FARMER_ADDRESS.trim()){
            console.log("from or to staking contract");
            console.log("from: ", from);
            console.log("to: ", to);
            return;
        }

        // if(from == serverConfig.chain.contracts.STAKER_FARMER_ADDRESS_OLD.trim() || to == serverConfig.chain.contracts.STAKER_FARMER_ADDRESS_OLD.trim()){
        //     console.log("from or to staking contract");
        //     console.log("from: ", from);
        //     console.log("to: ", to);
        //     return;
        // }

        try{
            bld = await buildingService.getBuilding(tokenId, TYPE);
        }catch(err){
            console.log("error in getBuilding..: ");
        }

        if(bld?.length == 0){
            console.log("token does'nt exist: ");
            return;
        }

	
        try{
            user = await buildingService.getUser(to);
            if(user.length == 0){
                response = await buildingService.createUser(to);
                console.log("creation of user: ", to, " response: ", response);
            }

            response = await buildingService.changeOwnership(tokenId, TYPE, to);
            console.log("response changeOwnership farmer: ", response);

            response = await buildingService.changeOwnershipBasicRod(to, tokenId, TYPE);
            console.log("response changeOwnershipBasicHoe farmer: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }


    }

    async mintOnChange(change){
        console.log("Change in mintOnChange farmer: ", change);
    }

    async mintOnError(error){
        console.log("Error in mintOnError farmer: ", error);
    }
}

module.exports = {MintService}