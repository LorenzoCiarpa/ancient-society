const resourceModel = require('./resourceModel');

let inventoryService = new resourceModel.InventoryService();
let burnService = new resourceModel.BurnService();

const TYPE = 2;

class BurnService {
    constructor() {}

    async burnOnData(event){
        console.log("burnOnData lj: ", event);
        console.log("");

        let idx = event.returnValues.idxBurn;
        let owner = event.returnValues._owner;
        let quantity = event.returnValues.quantity;
        let blockNumber = event.returnValues.blockNumber;

        let resources;
        let resource;
        let response;

        let burnRecord;

        quantity = parseInt(quantity);

        try{
            burnRecord = await burnService.getBurnRecordGivenTypeAndIdBurn(idx, TYPE);
            if(burnRecord.length > 0){
                console.log(`Evento duplicato, idx: ${idx}, owner: ${owner}, quantity: ${quantity}, blockNumber: ${blockNumber}, type: ${TYPE}`);
                return;
            }
            resources = await inventoryService.getResources(owner);
            resource = inventoryService.getResourceGivenType(resources, TYPE);
            resource += quantity;
            response = await inventoryService.setResourcesGivenType(owner, TYPE, resource);
            console.log("Response update inventory: ", response);

            let burnTime = new Date().toISOString().slice(0, -1);

            response = await burnService.updateBurnRecord(idx, owner, quantity, burnTime, TYPE, blockNumber);
            console.log("Response update BurnRecord: ", response);
            
        }catch(err){
            console.log("Error in burnOnData LJ: ", err);
        }
    }

    async burnOnChange(event){
        console.log("burnOnChange lj: ", event);
    }

    async burnOnError(event){
        console.log("burnOnError lj: ", event);
    }
}

module.exports ={BurnService}