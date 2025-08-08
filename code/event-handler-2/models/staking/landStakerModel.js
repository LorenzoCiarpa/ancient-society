const landModel = require('./landQueries');
const stakerQueries = new landModel.LandQueries()

const TYPE = 2;
class StakerLand {
    constructor() {}

    
        
    async stakeOnData(event){
        console.log("data stake land: ", event);
        let res;
        let land;
        let newPosition = 1;
        let found = false;
        let resValues = event.returnValues;
        
        

        try{
            land = await stakerQueries.getStakedLand(resValues.owner);
        }catch(err){
            console.log("error in getStakedLand..: ", err);
            return
        }
        //return null se una e' gia' stakata 
        if(land.length != 0) {
            console.log(`trovata land stakata`)
            return
        }

        try{
            res = await stakerQueries.setStakeQuery(resValues.tokenId,1);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            return
            // log.error("error in save ... :", err);
        }
    }

    async unstakeOnData(event){
        console.log("data unstake land: ", event);
        let res;
        let resClaim;
        let resValues = event.returnValues;


        //prendo le info della land
        let land
        try {
            land = await stakerQueries.getStorageLand(resValues.tokenId,resValues.owner)
        } catch (error) {
            console.log(`error in getStorageLand`,error)
            return
        }
        console.log("storage of the land: ", land.storage);
        
        try{
            resClaim = await stakerQueries.landClaimUnstake(resValues.tokenId,land.type,resValues.owner);
        }catch(error){
            console.log("resClaim: error", error)
            return
        }
        console.log("resClaim: ", resClaim)


        try{
            res = await stakerQueries.setStakeQuery(resValues.tokenId,0);
            console.log("response in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            return
            // log.error("error in save ... :", err);
        }

    }

    async stakeOnChange(event){
        console.log("change stake land: ", event);
    }

    async unstakeOnChange(event){
        console.log("change unstake land: ", event);
        
    }

    async stakeOnError(event){
        console.log("error stake land: ", event);

    }

    async unstakeOnError(event){
        console.log("error unstake land: ", event);
        
    }

    
}



module.exports = {StakerLand}