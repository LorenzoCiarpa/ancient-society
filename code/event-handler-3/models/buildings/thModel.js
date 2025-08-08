const buildingModel = require('./buildingModel');
const TYPE = 1;
const {serverConfig} = require('../../config/web3Config')

let buildingService = new buildingModel.BuildingService();

class MintService {
    constructor(){}

    async mintBundleOnData(event){
        console.log("event mintBundleOnData th: ", event);
        console.log("");
        console.log("");
        console.log("");
        // console.log("event 2 mintBundleOnDataReturnValues: ", event.returnValues);
        let player = event.returnValues.player;
        let tokenId = event.returnValues.tokenId;
	
        try{
            let imageUrl = buildingService.getImageBundleUrlPrerevealGivenIdAndType(tokenId, TYPE);
            let response = await buildingService.changeImageBundle(tokenId, TYPE, imageUrl);
            console.log("response changeImageBundle TH: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }

    async mintBundleOnChange(change){
        console.log("Change in mintBundleOnChange th: ", change);
    }

    async mintBundleOnError(error){
        console.log("Error in mintBundleOnError th: ", error);
    }

    async mintOnData(event){
        console.log("event mintOnData th: ", event);
        console.log("");
        console.log("");
        console.log("");
        let from = event.returnValues.from;
        let to = event.returnValues.to;
        let tokenId = event.returnValues.tokenId;
        let user;
        let response;

        console.log(" tokenId: ", tokenId);
        console.log("from: ", from);
        console.log("to: ", to);

        if(from == serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS.trim() || to == serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS.trim()){
            console.log("from or to staking contract");
            console.log("from: ", from);
            console.log("to: ", to);
            return;
        }

        if(from == serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS_OLD.trim() || to == serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS_OLD.trim()){
            console.log("from or to staking contract");
            console.log("from: ", from);
            console.log("to: ", to);
            return;
        }
	
        try{
            user = await buildingService.getUser(to);
            if(user.length == 0){
                response = await buildingService.createUser(to);
                console.log("creation of user: ", to, " response: ", response);
            }

            response = await buildingService.changeOwnership(tokenId, TYPE, to);
            console.log("response changeOwnership th: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ");
            // log.error("error in save ... :", err);
        }


    }

    async mintOnChange(change){
        console.log("Change in mintOnChange th: ", change);
    }

    async mintOnError(error){
        console.log("Error in mintOnError th: ", error);
    }
}

module.exports = {MintService}