const resourceModel = require('./resourceModel');

let inventoryService = new resourceModel.InventoryService();
let burnService = new resourceModel.BurnService();

const TYPE = 1;

class BurnService {
    constructor() {}

    async burnOnData(event){
        console.log("burnOnData th: ", event);
        console.log("");

        let idx = event.returnValues.idxBurn;
        let owner = event.returnValues._owner;
        let quantity = event.returnValues.quantity;
        let blockNumber = event.returnValues.blockNumber;

        let resources;
        let resource;
        let response;

        let burnRecord;
        let burnTime;
        let lastBurns;
        let lastBurnTime;
        
        quantity = parseInt(quantity);

        try{
            lastBurns = await burnService.getLastBurnRecordByAddressAndType(owner, TYPE);
        }catch(error){
            console.log("Error in getLastBurnRecordByAddressAndType TH: ", error);
        }

        try{
            burnRecord = await burnService.getBurnRecordGivenTypeAndIdBurn(idx, TYPE);
            if(burnRecord.length > 0){
                console.log(`Evento duplicato, idx: ${idx}, owner: ${owner}, quantity: ${quantity}, blockNumber: ${blockNumber}, type: ${TYPE}`)
                return;
            }
            resources = await inventoryService.getResources(owner);
            console.log("resources address: ", resources);
            resource = inventoryService.getResourceGivenType(resources, TYPE);
            console.log("resource address: ", resource);
            resource += quantity;
            response = await inventoryService.setResourcesGivenType(owner, TYPE, resource);
            console.log("Response update inventory: ", response);

            burnTime = new Date();
            let burnTimestamp = burnTime.toISOString().slice(0, -1);

            response = await burnService.updateBurnRecord(idx, owner, quantity, burnTimestamp, TYPE, blockNumber);
            console.log("Response update BurnRecord: ", response);
            
        }catch(err){
            console.log("Error in burnOnData TH: ", err);
        }

        if(quantity < 5){
            console.log("quantity lees than 5: ", quantity)
            return;
        }

        let stakedNft
        try{    
            stakedNft = await burnService.getStakedNFT(owner);
        }catch(error){
            console.log("Error in getStakedNFT TH: ", error);
        }

        if(stakedNft.length == 0){
            console.log("Exiting not staked nfts")
            return;
        }

        for(let nft of stakedNft){
            let struct = await burnService.getOwnerStruct(nft.idBuilding, nft.type);
            // console.log("struct: ", struct)
            let stakingTime = new Date(struct.blockTime * 1000);

            // console.log("now: ", new Date(), "staking time: ", stakingTime);

            if(burnTime - stakingTime < 86400000){
                console.log(`Exiting nft staked less than 24h, idBuilding: ${nft.idBuilding}, type: ${nft.type}, stakingTime: ${stakingTime}`)
                return;
            }
        }

        if(lastBurns.length > 0){
            console.log("MULTIPLE BURN")

            lastBurnTime = new Date(lastBurns[0].burnTime);

            if(burnTime - lastBurnTime < 86400000){
                console.log("Exiting a day is NOT past: ", owner);                
                return;
            }

            console.log("A day is past, dropping new reward")

        } else {
            console.log("FIRST BURN")

        }

        try{    
            response = await burnService.createDailyReward(owner);
        }catch(error){
            console.log("Error in createDailyReward TH: ", error);
        }

        console.log("daily reward created: ", response)


        let dailyRewardDrop
        try{    
            dailyRewardDrop = await burnService.getDailyRewardDrop();
        }catch(error){
            console.log("Error in getDailyRewardDrop TH: ", error);
        }

        if(dailyRewardDrop.length == 0) {
            console.log("No reward to drop")
            return;
        }

        console.log("dailyRewardDrop: ", dailyRewardDrop)

        try{    
            response = await burnService.dropDailyReward(owner, dailyRewardDrop[0].idItem, dailyRewardDrop[0].quantity);
        }catch(error){
            console.log("Error in dropDailyReward TH: ", error);
        }

        console.log("daily reward dropped: ", response)
        
    }

    async burnOnChange(event){
        console.log("burnOnChange th: ", event);
    }

    async burnOnError(event){
        console.log("burnOnError th: ", event);
    }
}

module.exports ={BurnService}