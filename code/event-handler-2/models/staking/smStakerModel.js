const StakerModel = require('./stakerModel');
let stakerService = new StakerModel.StakerService();
let dropService = new StakerModel.DropService();

const TYPE = 3;

class StakerStonemine{
    constructor() {}

    async stakeOnData(event){
        console.log("data stake sm: ", event);
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
            res = await stakerService.setStakeQuery(resValues, 3, 1, newPosition);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async unstakeOnData(event){
        console.log("data unstake sm: ", event);
        let res;
        let resClaim;
        let resValues = event.returnValues;
        let newStoredResponse;

        newStoredResponse = await dropService.calculateNewStoredResources(resValues.tokenId, 3);
        console.log("newStoredResponse: ", newStoredResponse);

        try{
            resClaim = await stakerService.makeClaimUnstake(resValues, TYPE);
        }catch(error){
            console.log("resClaim: error", error)
        }
        console.log("resClaim: ", resClaim)
        
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);
    
        try{
            res = await stakerService.setStakeQuery(resValues, 3, 0, 0);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    
    }

    async stakeOnDataNew(event){
        console.log("data stake sm new: ", event);
        let res;
        let nfts;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        let freePosition;
        
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        let owner;
        try{
            owner = await stakerService.getOwnerByIdAndType(resValues.tokenId, 3);
        }catch(err){
            console.log("error in getOwnerByIdAndType..: ", err);
        }

        owner = owner[0].address;
        
        let stakedMiners
        try{
            stakedMiners = await stakerService.getStakedNFTByType(owner, 3);
        }catch(err){
            console.log("error in getStakedNFTByType..: ", err);
        }

        if(stakedMiners.length > 0){
            console.log("You have already staked a Stonemine: ");
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
            res = await stakerService.setStakeQuery(resValues, 3, 1, newPosition);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 3, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async unstakeOnDataNew(event){
        console.log("data unstake sm: ", event);
        let res;
        let resValues = event.returnValues;
        let newStoredResponse;
        
        newStoredResponse = await dropService.calculateNewStoredResources(resValues.tokenId, 3);
        console.log("newStoredResponse: ", newStoredResponse);
        
        let resClaim;
        try{
            resClaim = await stakerService.makeClaimUnstake(resValues, 3);
        }catch(error){
            console.log("resClaim: error", error)
        }
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            res = await stakerService.unequipTool(resValues.tokenId, 3);
            console.log("response in unequipTool..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in unequipTool..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setStakeQuery(resValues, 3, 0, 0);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 3, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    
    }
    
    async stakeOnChange(event){
        console.log("change stake sm: ", event);
    }
    
    async unstakeOnChange(event){
        console.log("change unstake sm: ", event);
        
    }
    
    async stakeOnError(event){
        console.log("error stake sm: ", event);
    
    }
    
    async unstakeOnError(event){
        console.log("cerrorange unstake sm: ", event);
        
    }
}

module.exports = {StakerStonemine}