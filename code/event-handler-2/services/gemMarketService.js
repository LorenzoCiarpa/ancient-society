// const GemBuildingAbi = require('../ABI/broken-building-abi.json');

const {GemMarketQueries} = require('../queries/gemMarketQueries');
// const {GemMarketHelper} = require('../helpers/gemMarketHelper');

const {serverConfig} = require('../config/web3Config')



const web3 = serverConfig.chain.httpWeb3;

// const brokenBuilding = new web3.eth.Contract(GemBuildingAbi, process.env.ANCIENT_BUILDING_OMEGA);
// const ITEM = "item"
// const RECIPE = "recipe"
// const TOOL = "tool"
// const BUILDING = "building"


class GemMarketService{

    static async purchaseHandler(event){
        console.log("purchaseHanlder START: ", event)

        let buyer = event.returnValues.buyer;
        let idBundleGems = event.returnValues.index;
        let pricePaid = event.returnValues.price;
        let quantity = event.returnValues.quantity;

        let transaction_hash = event.transactionHash
    
        let resUpdateHistory;
        let offer;
        try{
            resUpdateHistory = await GemMarketQueries.addMarketHistory(
                idBundleGems, 
                buyer,  
                quantity,
                pricePaid,
                transaction_hash
            );
        }catch(error){
            console.log("Error in addMarketHistory", error);
            // throw error;
            return;
        }


        if(resUpdateHistory.insertId == 0){
            console.log("exiting for duplicate entry");
            // throw new Error("exiting for duplicate entry");
            return;
        }

        pricePaid = web3.utils.fromWei(pricePaid, 'ether');
        console.log("pricePaid: ", pricePaid);
        
        try{
            offer = await GemMarketQueries.getBundleByIndex(idBundleGems);
        }catch(error){
            console.log("Error in getBundleByIndex", error);
            // throw error;
            return;
        }

        if(offer == undefined || offer == null || offer.length == 0 ){
            console.log(`Exiting, idBundleGems wrong, idBundleGems: ${idBundleGems}`);
            // throw new Error("Exiting, idBundleGems wrong, idBundleGems");
            return;
        }

        offer = offer[0]
        console.log("offer: ", offer)
        if(offer.price * quantity > pricePaid){
            console.log(`Exiting, price not correct, price: ${pricePaid}`);
            // throw new Error(`Exiting, price not correct, price: ${pricePaid}`);
            return;
        }

        try{
            offer = await GemMarketQueries.dropItem(buyer, offer.idItem, offer.quantity * quantity);
        }catch(error){
            console.log("Error in getBundleByIndex", error);
            // throw error;
            return;
        }
        
        return;
    }

}

module.exports = { GemMarketService }
