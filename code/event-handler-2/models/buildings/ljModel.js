const buildingModel = require('./buildingModel');
const TYPE = 2;
const {serverConfig} = require('../../config/web3Config')

let buildingService = new buildingModel.BuildingService();

class MintService {
    constructor(){}

    async mintBundleOnData(event){
        console.log("event mintBundleOnData lj: ", event);
        console.log("");
        console.log("");
        console.log("");
        // console.log("event 2 mintBundleOnDataReturnValues: ", event.returnValues);
        let player = event.returnValues.player;
        let tokenId = event.returnValues.tokenId;
	
        try{
            let imageUrl = buildingService.getImageBundleUrlPrerevealGivenIdAndType(tokenId, TYPE);
            let response = await buildingService.changeImageBundle(tokenId, TYPE, imageUrl);
            console.log("response changeImageBundle LJ: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }

    async mintBundleOnChange(change){
        console.log("Change in mintBundleOnChange lj: ", change);
    }

    async mintBundleOnError(error){
        console.log("Error in mintBundleOnError lj: ", error);
    }

    async mintOnData(event){
        console.log("event mintOnData lj: ", event);
        console.log("");
        console.log("");
        console.log("");
        let from = event.returnValues.from;
        let to = event.returnValues.to;
        let tokenId = event.returnValues.tokenId;
        let user;
        let response;

        if(from == serverConfig.chain.contracts.STAKER_LUMBERJACK_ADDRESS.trim() || to == serverConfig.chain.contracts.STAKER_LUMBERJACK_ADDRESS.trim()){
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
            console.log("response changeOwnership LJ: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }

    async mintOnChange(change){
        console.log("Change in mintOnChange lj: ", change);
    }

    async mintOnError(error){
        console.log("Error in mintOnError lj: ", error);
    }
}

module.exports = {MintService}