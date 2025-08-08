const StakerModel = require('./stakerModel');
let stakerService = new StakerModel.StakerService();
let dropService = new StakerModel.DropService();

const TYPE = 2;
class StakerLumberjack {
    constructor() {}

        
    async stakeOnData(event){
        console.log("data stake lj: ", event);
        let res;
        let nfts;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            nfts = await stakerService.getStakedNFT(resValues.owner);
        }catch(err){
            console.log("error in getStakedNFT..: ", err);
        }

        while(!found){
            if(stakerService.isPositionUsed(nfts, newPosition)){
                newPosition++;
            }else{
                found = true;
            }
        }

        try{
            res = await stakerService.setStakeQuery(resValues, 2, 1, newPosition);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }

    async unstakeOnData(event){
        console.log("data unstake lj: ", event);
        let res;
        let resClaim;
        let resValues = event.returnValues;
        let newStoredResponse;

        newStoredResponse = await dropService.calculateNewStoredResources(resValues.tokenId, 2);
        console.log("newStoredResponse: ", newStoredResponse);
        
        try{
            resClaim = await stakerService.makeClaimUnstake(resValues, TYPE);
        }catch(error){
            console.log("resClaim: error", error)
        }
        console.log("resClaim: ", resClaim)

        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            res = await stakerService.setStakeQuery(resValues, 2, 0, 0);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }

    }

    async stakeOnDataNew(event){
        console.log("data stake lj new: ", event);
        let res;
        let nfts;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        let freePosition;
        
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        let owner;
        try{
            owner = await stakerService.getOwnerByIdAndType(resValues.tokenId, 2);
        }catch(err){
            console.log("error in getOwnerByIdAndType..: ", err);
        }

        owner = owner[0].address;
        
        let stakedMiners
        try{
            stakedMiners = await stakerService.getStakedNFTByType(owner, 2);
        }catch(err){
            console.log("error in getStakedNFTByType..: ", err);
        }

        if(stakedMiners.length > 0){
            console.log("You have already staked a Lumberjack: ");
            return;
        }

        try{
            nfts = await stakerService.getStakedNFT(owner);
        }catch(err){
            console.log("error in getStakedNFT..: ", err);
        }

        while(!found){
            if(stakerService.isPositionUsed(nfts, newPosition)){
                newPosition++;
            }else{
                found = true;
            }
        }
            
        try{
            res = await stakerService.setStakeQuery(resValues, 2, 1, newPosition);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 2, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async unstakeOnDataNew(event){
        console.log("data unstake lj: ", event);
        let res;
        let resValues = event.returnValues;
        let newStoredResponse;

        newStoredResponse = await dropService.calculateNewStoredResources(resValues.tokenId, 2);
        console.log("newStoredResponse: ", newStoredResponse);
        
        let resClaim;
        try{
            resClaim = await stakerService.makeClaimUnstake(resValues, 2);
        }catch(error){
            console.log("resClaim: error", error)
        }
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            res = await stakerService.unequipTool(resValues.tokenId, 2);
            console.log("response in unequipTool..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in unequipTool..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setStakeQuery(resValues, 2, 0, 0);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 2, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    
    }

    async stakeOnChange(event){
        console.log("change stake lj: ", event);
    }

    async unstakeOnChange(event){
        console.log("change unstake lj: ", event);
        
    }

    async stakeOnError(event){
        console.log("error stake lj: ", event);

    }

    async unstakeOnError(event){
        console.log("cerrorange unstake lj: ", event);
        
    }
}

module.exports = {StakerLumberjack}