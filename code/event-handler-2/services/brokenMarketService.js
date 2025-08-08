const {BrokenMarketQueries} = require('../queries/brokenMarketQueries');
const {BrokenMarketHelper} = require('../helpers/brokenMarketHelper');

//CONFIG
const {serverConfig} = require('../config/web3Config')


const ITEM = "item"
const RECIPE = "recipe"
const TOOL = "tool"
const BUILDING = "building"


class BrokenMarketService{

    static async purchaseHandler(event){
        console.log("purchaseHanlder START: ", event)

        let buyer = event.returnValues.buyer;
        let indexPurchase = event.returnValues.indexPurchase;
        let idBrokenMarketplace = event.returnValues.offer;
        let quantity = event.returnValues.quantity;

        let transaction_hash = event.transactionHash
    
        let resUpdateHistory;
        let offerList;
        let referalInstance;

        try{
            resUpdateHistory = await BrokenMarketQueries.addMarketHistory(
                indexPurchase, 
                buyer, 
                idBrokenMarketplace, 
                quantity,
                transaction_hash
            );
        }catch(error){
            console.log("Error in addMarketHistory", error);
            throw error;
        }

        if(resUpdateHistory.insertId == 0){
            console.log("exiting for duplicate entry");
            return;
        }

        // try{
        //     referalInstance = await BrokenMarketQueries.getReferalActive(buyer);
        // }catch(error){
        //     console.log("Error in getReferalActive", error);
        //     throw error;
        // }

        // if(referalInstance.length > 0){
        //     console.log("Dropping Referal reward", referalInstance);
        //     referalInstance = referalInstance[0];

        //     try{
        //         referalInstance = await BrokenMarketQueries.dropReferalReward(
        //             buyer, 
        //             referalInstance.idItem, 
        //             referalInstance.quantity,
        //             referalInstance.addressReferal,
        //             referalInstance.idItemPoint,
        //             referalInstance.price * quantity,
        //             referalInstance.idReferalInstance
        //         );
        //     }catch(error){
        //         console.log("Error in dropReferalReward", error);
        //         throw error;
        //     }
        // }
        
        try{
            offerList = await BrokenMarketQueries.getOfferListByIndexOffer(idBrokenMarketplace);
        }catch(error){
            console.log("Error in addMarketHistory", error);
            throw error;
        }

        for(let idx = 0; idx < quantity; idx ++){
            console.log("Dropping i-esima quantity: ", idx)

            for(let offer of offerList){
                console.log("Dropping i-esima offer: ", offer)

                let resOfferDrop;
                switch(offer.offerType){
                    case ITEM: {
                        try{
                            resOfferDrop = await BrokenMarketHelper.dropItem(buyer, offer.idItem, offer.quantity)
                        }catch(error){
                            console.log("Error in BrokenMarketHelper.dropItem, ", error)
                        }
                        break;
                    } 
                    case RECIPE: {
                        try{
                            resOfferDrop = await BrokenMarketHelper.dropRecipe(buyer, offer.idRecipe, offer.quantity)
                        }catch(error){
                            console.log("Error in BrokenMarketHelper.dropRecipe, ", error)
                        }
                        break;
                    }
                    case TOOL: {
                        try{
                            resOfferDrop = await BrokenMarketHelper.dropTool(buyer, offer.idToolLevel, offer.quantity)
                        }catch(error){
                            console.log("Error in BrokenMarketHelper.dropTool, ", error)
                        }
                        break;
                    }
                    case BUILDING: {
                        try{
                            resOfferDrop = await BrokenMarketHelper.dropBuilding(buyer, offer.idUpgrade, offer.quantity)
                        }catch(error){
                            console.log("Error in BrokenMarketHelper.dropBuilding, ", error)
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
        }

        
        return;
    }
}

module.exports = { BrokenMarketService }
