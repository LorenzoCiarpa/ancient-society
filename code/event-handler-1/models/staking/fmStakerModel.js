const StakerModel = require('./stakerModel');
let stakerService = new StakerModel.StakerService();
let dropService = new StakerModel.DropService();

class StakerFisherman{
    constructor(){}

    async stakeOnData(event){
        console.log("data stake fm: ", event);
        let res;
        let nfts;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        let freePosition;
        
        
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
        
        freePosition = stakerService.arePositionFishermanFree(nfts);

        if(!freePosition.success){
            res = await stakerService.changeBusyFishermanSpot(resValues.owner, newPosition);
            freePosition.position = 7;

            console.log("response in changeBusyFishermanSpot..: ", res);
        }
    
        try{
            res = await stakerService.setStakeQuery(resValues, 4, 1, freePosition.position);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async unstakeOnData(event){
        console.log("data unstake fm: ", event);
        let res;
        let resValues = event.returnValues;
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            res = await stakerService.unequipTool(resValues.tokenId, 4);
            console.log("response in unequipTool..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in unequipTool..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setStakeQuery(resValues, 4, 0, 0);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }
    
    }

    async stakeOnDataNew(event){
        console.log("data stake fm new: ", event);
        let res;
        let nfts;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        let freePosition;
        
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        let owner;
        try{
            owner = await stakerService.getOwnerByIdAndType(resValues.tokenId, 4);
        }catch(err){
            console.log("error in getOwnerByIdAndType..: ", err);
        }

        owner = owner[0].address;
        
        let stakedMiners
        try{
            stakedMiners = await stakerService.getStakedNFTByType(owner, 4);
        }catch(err){
            console.log("error in getStakedNFTByType..: ", err);
        }

        if(stakedMiners.length > 0){
            console.log("You have already staked a Fisherman: ");
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
            res = await stakerService.setStakeQuery(resValues, 4, 1, newPosition);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 4, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async unstakeOnDataNew(event){
        console.log("data unstake fm: ", event);
        let res;
        let resValues = event.returnValues;
        let newStoredResponse;
        
        resValues.lastClaim = new Date().toISOString().slice(0, -1);

        try{
            res = await stakerService.unequipTool(resValues.tokenId, 4);
            console.log("response in unequipTool..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in unequipTool..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setStakeQuery(resValues, 4, 0, 0);
            console.log("response in setStakeQuery..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setStakeQuery..: ", err);
            // log.error("error in save ... :", err);
        }

        try{
            res = await stakerService.setIsOldContract(resValues.tokenId, 4, false);
            console.log("response in setIsOldContract..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in setIsOldContract..: ", err);
            // log.error("error in save ... :", err);
        }
    
    }
    
    async stakeOnChange(event){
        console.log("change stake fm: ", event);
    }
    
    async unstakeOnChange(event){
        console.log("change unstake fm: ", event);
        
    }
    
    async stakeOnError(event){
        console.log("error stake fm: ", event);
    
    }
    
    async unstakeOnError(event){
        console.log("cerrorange unstake fm: ", event);
        
    }
}

module.exports = {StakerFisherman}