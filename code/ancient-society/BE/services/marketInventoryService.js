const logger = require('../logging/logger');
const { MarketInventoryQueries } = require('../queries/marketInventoryQueries');
const { MarketQueries } = require('../queries/marketQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { MarketInventoryInterface } = require('../interfaces/JS/marketplaceInventoryInterface')

const {serverConfig} = require('../config/serverConfig')

const UserModel = require('../models/userModel');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { RecipeQueries } = require('../queries/inventory/recipeQueries');
const { ToolQueries } = require('../queries/inventory/toolQueries');



const { Utils } = require('../utils/utils');
const { add } = require('winston');
const { ToolService } = require('./inventory/toolService');

const  InventoryQueriesPvp  = require(`../queries/pvp/inventoryQueries`).InventoryQueries
const  ItemQueriesPvp  = require(`../queries/pvp/inventory/itemQueries`).ItemQueries
const  RecipeQueriesPvp  = require(`../queries/pvp/inventory/recipeQueries`).RecipeQueries
const  GearQueriesPvp  = require(`../queries/pvp/inventory/gearQueries`).GearQueries
const  CardQueriesPvp  = require(`../queries/pvp/inventory/cardQueries`).CardQueries
const  UserQueriesPvp  = require(`../queries/pvp/userQueries`).UserQueries

const userInventory = new UserModel.InventoryService();

const MAX_VIEW = 15;
const MAX_AD_NUMBER = 25;
const MAX_LISTING_TIME = (3600 * 24 * 28 + 3600 * 23); // 28 days and 23 h

class InventoryModel {
    constructor(result, ancien, wood, stone) {
        this.status = result,
            this.resources = {
                ancien: ancien,
                wood: wood,
                stone: stone
            }

    }
}

class MarketInventoryService {
    constructor() { }

    static changeStatusForOwner(listing, address) {
        for (let i = 0; i < listing.length; i++) {
            if (listing[i].owner == address) {
                listing[i].status = 4;
            }
        }
        return listing;
    }

    static buildFinalResponse(listing) {
        let listingResponse = [];

        for (let i = 0; i < listing.length; i++) {
            let ad = {};

            ad.id = listing[i].id;
            ad.type = listing[i].type;
            ad.quantity = listing[i].quantity;
            ad.price = listing[i].price;
            ad.totalPrice = listing[i].totalPrice;
            ad.endingTime = listing[i].endingTime;
            ad.saleTime = listing[i].saleTime;
            ad.status = listing[i].status;

            listingResponse.push(ad);
        }
        return listingResponse;
    }

    static buildResourcesResponse(rows) {
        let response;
        if (rows.ancien != undefined && rows.wood != undefined && rows.stone != undefined)
            response = new InventoryModel(true, rows.ancien, rows.wood, rows.stone);
        else {
            response = new InventoryModel(false);
        }
        return response;
    }

    static getResourceGivenType(resources, type) {
        switch (type) {
            case 1: {
                return resources.ancien;
            }

            case 2: {
                return resources.wood;
            }

            case 3: {
                return resources.stone;
            }

            default: {
                return null;
            }
        }
    }

    static async getCheapestInventories(address) {
        logger.info(`getCheapestInventories service start`)

        let inventoryList
        try {
            inventoryList = await MarketInventoryQueries.getCheapestInventories(address)
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries.getCheapestInventories: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let resourceList
        try {
            resourceList = await MarketQueries.getCheapestResources(address)
        } catch (error) {
            logger.error(`Error in MarketQueries.getCheapestResources: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let response = { items: [], recipes: [], tools: [], resources: resourceList }
        // mar_inv.idToolInstance as inventoryInstanceId, mar_inv.inventoryType, t_ins.idTool AS inventoryId, mar_inv.price AS inventoryPrice,
        // t.name AS inventoryName, t.image AS inventoryImage, t.description AS inventoryDesc, t_lev.level AS inventoryLevel 
        let alreadyHasInventory = {}
        for (let inventory of inventoryList) {
            let uid = `${inventory.inventoryType}-${inventory.inventoryId}-${inventory.inventoryPrice}-${inventory.inventoryName}-${inventory.inventoryImage}-${inventory.inventoryDesc}-${inventory.inventoryLevel}`
            if (alreadyHasInventory[uid] == undefined) {
                response[inventory.inventoryType + 's'].push(inventory)
            }
            alreadyHasInventory[uid] = true
        }

        let toolIds = []
        for (let tool of response.tools) {
            toolIds.push(tool.inventoryInstanceId)
        }
        if (toolIds.length != 0) {
            toolIds = toolIds.join(', ')
            logger.info(`toolIds: ${toolIds}`)
            let toolBonuses
            try {
                toolBonuses = await ToolService.getToolBonuses(toolIds)
            } catch (error) {
                logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                throw error
            }
            logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

            for (let tool of response.tools) {
                tool.bonuses = toolBonuses[tool.inventoryInstanceId] ? toolBonuses[tool.inventoryInstanceId].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        logger.info(`getCheapestInventories service end`)

        return response
    }

    static async getCheapestInventoriesPvp(address) {
        logger.info(`getCheapestInventoriesPVP service start`)

        let inventoryList
        try {
            inventoryList = await MarketInventoryQueries.getCheapestInventoriesPvp(address)
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries.getCheapestInventories: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let response = { items: [], recipes: [], gears: [], cards:[]}
        // mar_inv.idToolInstance as inventoryInstanceId, mar_inv.inventoryType, t_ins.idTool AS inventoryId, mar_inv.price AS inventoryPrice,
        // t.name AS inventoryName, t.image AS inventoryImage, t.description AS inventoryDesc, t_lev.level AS inventoryLevel 
        let alreadyHasInventory = {}
        for (let inventory of inventoryList) {
            let uid = `${inventory.inventoryType}-${inventory.inventoryId}-${inventory.inventoryPrice}-${inventory.inventoryName}-${inventory.inventoryImage}-${inventory.inventoryDesc}-${inventory.inventoryLevel}`
            if (alreadyHasInventory[uid] == undefined) {
                response[inventory.inventoryType + 's'].push(inventory)
            }
            alreadyHasInventory[uid] = true
        }

        logger.info(`getCheapestInventoriesPVP service end`)

        return response
    }

    static async setResourcesGivenType(address, type, resource) {
        logger.info(`setResourcesGivenType start`);
        logger.info(`type setRes:${resource}`);
        switch (type) {
            case 1: {
                return await MarketInventoryQueries.setAncien(address, resource);
            }

            case 2: {
                return await MarketInventoryQueries.setWood(address, resource);
            }

            case 3: {
                console.log("arrivato");
                return await MarketInventoryQueries.setStone(address, resource);
            }

            default:
                return null;
        }
    }

    static async addResourcesGivenType(address, type, resource) {
        logger.info(`addResourcesGivenType start`);
        logger.info(`type setRes:${resource}`);
        switch (type) {
            case 1: {
                return await MarketInventoryQueries.addAncien(address, resource);
            }

            case 2: {
                return await MarketInventoryQueries.addWood(address, resource);
            }

            case 3: {
                return await MarketInventoryQueries.addStone(address, resource);
            }

            default:
                return null;
        }
    }

    static async getAccountListing(address) {
        logger.debug(`getAccountListing service start`);

        let listing;
        let listingPostStatus;
        let listingResponse;
        let storage;
        let adAllowed;
        let adOnSale;

        try {
            listing = await MarketInventoryQueries.getAccountListing(address);

            logger.debug(`listing: ${JSON.stringify(listing)}`);

            listingPostStatus = await MarketInventoryService.checkListingStatus(listing);
            listingResponse = MarketInventoryInterface.buildFinalResponse(listingPostStatus);

            logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

            storage = await userInventory.getResources(address);
            storage = userInventory.buildResourcesResponse(storage);

            logger.debug(`storage: ${JSON.stringify(storage)}`);

            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
            adAllowed = (adOnSale.length < 25) ? true : false;

            logger.debug(`adAllowed: ${JSON.stringify(adOnSale)}`);
        } catch (error) {
            logger.error(`error in marketInventoryService getAccountListing: ${Utils.printErrorLog(error)}`);
        }

        return {
            listings: listingResponse,
            storage,
            adAllowed
        }


    }

    static async checkListingStatus(listing) {
        let now = new Date().getTime();

        let idToUpdate = [];
        let responseUpdateStatus;
        let responseItem;
        let responseCreateItem;
        let responseRecipe;
        let responseCreateRecipe;
        let responseTool;
        let responseCreateTool;

        console.log("listing: ", listing);

        for (let i = 0; i < listing.length; i++) {
            //new Date(null) => 1 january 1970
            let endingTimeMillisec = new Date(listing[i].endingTime).getTime();

            if (now >= endingTimeMillisec && listing[i].status == 1) {
                if(!listing[i].isPvp){
                    if (listing[i].inventoryType == 'item') {
                        try {
                            responseCreateItem = await InventoryQueries.updatedItemInstanceByAddress('create', listing[i].owner, listing[i].idItem, 0);
                            console.log("responseCreateItem: ", responseCreateItem)

                            responseItem = await ItemQueries.getItemInstanceByAddressAndIdItem(listing[i].owner, listing[i].idItem);
                            responseItem = await ItemQueries.addItemByIdItemInstanceMarket(responseItem[0].idItemInstance, listing[i].quantity, listing[i].idMarketplaceInventory);

                        } catch (error) {
                            logger.error(`Error in checkListingStatus item, error: ${Utils.printErrorLog(error)}`);
                            throw new Error(error.message);
                        }

                    } else if (listing[i].inventoryType == 'recipe') {
                        try {
                            responseCreateRecipe = await InventoryQueries.updatedRecipeInstanceByAddress('create', listing[i].owner, listing[i].idRecipe, 0);
                            console.log("[responseCreateRecipe]: ", responseCreateRecipe)

                            responseRecipe = await RecipeQueries.getRecipeInstanceByAddressAndIdItem(listing[i].owner, listing[i].idRecipe);
                            responseRecipe = await RecipeQueries.addRecipeByIdRecipeInstanceMarket(responseRecipe[0].idRecipeInstance, listing[i].quantity, listing[i].idMarketplaceInventory);


                        } catch (error) {
                            logger.error(`Error in checkListingStatus recipe, error: ${JSON.stringify({ error }, Object.getOwnPropertyNames(error))}`, error);
                            throw new Error(error.message);
                        }
                    } else if (listing[i].inventoryType == 'tool') {
                        try {

                            responseTool = await InventoryQueries.changeToolOwner(listing[i].idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, listing[i].owner);
                            logger.info("[changeToolOwner]: ", responseCreateRecipe)

                            responseUpdateStatus = await MarketInventoryQueries.updateAdStatus(listing[i].idMarketplaceInventory);
                            logger.debug(`responseUpdateStatus: ${JSON.stringify(responseUpdateStatus)}`);
                        } catch (error) {
                            logger.error(`Error in checkListingStatus recipe, error: ${JSON.stringify({ error }, Object.getOwnPropertyNames(error))}`, error);
                            throw new Error(error.message);
                        }
                    }
                }else{
                    if (listing[i].inventoryType == 'item') {
                        try {
                            responseCreateItem = await InventoryQueriesPvp.updatedItemInstanceByAddress('create', listing[i].owner, listing[i].idItem, 0);
                            console.log("responseCreateItem: ", responseCreateItem)

                            responseItem = await ItemQueriesPvp.getItemInstanceByAddressAndIdItem(listing[i].owner, listing[i].idItem);
                            responseItem = await ItemQueriesPvp.addItemByIdItemInstanceMarket(responseItem[0].idItemInstance, listing[i].quantity, listing[i].idMarketplaceInventory);

                        } catch (error) {
                            logger.error(`Error in checkListingStatus item, error: ${Utils.printErrorLog(error)}`);
                            throw new Error(error.message);
                        }

                    } else if (listing[i].inventoryType == 'recipe') {
                        try {
                            responseCreateRecipe = await InventoryQueriesPvp.updatedRecipeInstanceByAddress('create', listing[i].owner, listing[i].idRecipe, 0);
                            console.log("[responseCreateRecipe]: ", responseCreateRecipe)

                            responseRecipe = await RecipeQueriesPvp.getRecipeInstanceByAddressAndIdItem(listing[i].owner, listing[i].idRecipe);
                            responseRecipe = await RecipeQueriesPvp.addRecipeByIdRecipeInstanceMarket(responseRecipe[0].idRecipeInstance, listing[i].quantity, listing[i].idMarketplaceInventory);


                        } catch (error) {
                            logger.error(`Error in checkListingStatus recipe, error: ${JSON.stringify({ error }, Object.getOwnPropertyNames(error))}`, error);
                            throw new Error(error.message);
                        }
                    } else if (listing[i].inventoryType == 'gear') {
                        try {

                            responseTool = await InventoryQueriesPvp.changeGearOwner(listing[i].idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, listing[i].owner);
                            logger.info("[changeGearOwner]: ", responseTool)

                            responseUpdateStatus = await MarketInventoryQueries.updateAdStatus(listing[i].idMarketplaceInventory);
                            logger.debug(`responseUpdateStatus: ${JSON.stringify(responseUpdateStatus)}`);
                        } catch (error) {
                            logger.error(`Error in checkListingStatus recipe, error: ${JSON.stringify({ error }, Object.getOwnPropertyNames(error))}`, error);
                            throw new Error(error.message);
                        }
                    }else if (listing[i].inventoryType == 'card') {
                        try {

                            responseTool = await InventoryQueriesPvp.changeCardOwner(listing[i].idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, listing[i].owner);
                            logger.info("[changeCardOwner]: ", responseTool)

                            responseUpdateStatus = await MarketInventoryQueries.updateAdStatus(listing[i].idMarketplaceInventory);
                            logger.debug(`responseUpdateStatus: ${JSON.stringify(responseUpdateStatus)}`);
                        } catch (error) {
                            logger.error(`Error in checkListingStatus recipe, error: ${JSON.stringify({ error }, Object.getOwnPropertyNames(error))}`, error);
                            throw new Error(error.message);
                        }
                    }
                }


                listing[i].status = 0;
                //idToUpdate.push(i);
            }
        }

        // if(idToUpdate.length > 0){
        //     try{   
        //         responseUpdateStatus = await this.updateMultipleAdStatus(idToUpdate, 0);

        //     }catch(error){
        //         console.log("Error in updateMultipleAdStatus: ", error);
        //     }
        // }

        return listing;
    }

    static async buyResourceAndInventory(address, buyIds, market) {
        logger.debug(`buyResourceAndInventory service start`);

        let listing;
        let listings = [];
        let listingResponse;
        let totalQuantity = 0;
        let totalPrice = 0;
        let ancien;
        let hasAlreadyBoughtInventory = false;
        let storage;

        let responseBuy;

        try {

            if (market == 'resource') {
                logger.info("buyResource Start");

                for (let i = 0; i < buyIds.length; i++) {
                    storage = await MarketInventoryQueries.getResources(address);

                    listing = await MarketInventoryQueries.getMarketplaceSingleListing(buyIds[i], address);
                    if (listing.length == 0) {
                        hasAlreadyBoughtInventory = true;
                        continue;
                    }

                    listingResponse = MarketInventoryInterface.buildFinalResourceResponse(listing);

                    if (listing[0].totalPrice <= storage.ancien) {

                        responseBuy = await MarketInventoryQueries.buyAdMarketplace(buyIds[i], address);

                        if (responseBuy.changedRows == 0) {
                            hasAlreadyBoughtInventory = true;
                            continue;
                        }

                        if (listing[0].type == 2) await MarketInventoryQueries.addWood(address, listing[0].quantity);
                        if (listing[0].type == 3) await MarketInventoryQueries.addStone(address, listing[0].quantity);

                        await MarketInventoryQueries.subAncien(address, listing[0].totalPrice);
                        
                        if(serverConfig.routes.fee.marketplaceFee){
                            let quantityToAdd = listing[0].totalPrice - (listing[0].totalPrice * serverConfig.routes.fee.marketplaceFeeValue);
                            await MarketInventoryQueries.addAncien(listing[0].owner, quantityToAdd);
                        }else{
                            await MarketInventoryQueries.addAncien(listing[0].owner, listing[0].totalPrice);
                        }

                        totalQuantity += listing[0].quantity;
                        totalPrice += listing[0].totalPrice;

                        listingResponse[0].bought = 1;
                    }
                    listings.push(listingResponse[0]);

                    logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);
                }
                storage = await MarketInventoryQueries.getResources(address);
                ancien = storage.ancien;

                logger.info("buyResource End");
            } else if (market == 'inventory') {
                logger.info("buyInventory Start");

                for (let i = 0; i < buyIds.length; i++) {
                    storage = await MarketInventoryQueries.getResources(address);

                    listing = await MarketInventoryQueries.getMarketplaceInventorySingleListing(buyIds[i], address);
                    if (listing.length == 0) {
                        hasAlreadyBoughtInventory = true;
                        continue;
                    }

                    listingResponse = MarketInventoryInterface.buildFinalResponse(listing);

                    if (listing[0].totalPrice <= storage.ancien) {

                        responseBuy = await MarketInventoryQueries.buyAd(buyIds[i], address);

                        if (responseBuy.changedRows == 0) {
                            hasAlreadyBoughtInventory = true;
                            continue;
                        }

                        if (listing[0].inventoryType == 'item') {

                            let receiverItemData;
                            try {
                                receiverItemData = await InventoryQueries.getReceiverItemData(address, listing[0].idItem, listing[0].quantity)
                            } catch (error) {
                                logger.error(`Error in InventoryQueries.getReceiverItemData: ${Utils.printErrorLog(error)}`)
                                return res
                                    .status(401)
                                    .json({
                                        success: false,
                                        error: {
                                            errorMessage: error
                                        }
                                    })
                            }
                            if (receiverItemData.length == 0) {
                                try {
                                    await InventoryQueries.updatedItemInstanceByAddress('create', address, listing[0].idItem, listing[0].quantity)
                                } catch (error) {
                                    console.log(error)
                                    logger.error(`Error in InventoryQueries.updatedItemInstanceByAddress: ${Utils.printErrorLog(error)}`)
                                    return res
                                        .status(401)
                                        .json({
                                            success: false,
                                            error: {
                                                errorMessage: error
                                            }
                                        })
                                }
                            } else {
                                try {
                                    await ItemQueries.addItemByIdItemAndAddress(address, listing[0].idItem, listing[0].quantity)
                                } catch (error) {
                                    logger.error(`Error in ItemQueries.addItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
                                    return res
                                        .status(401)
                                        .json({
                                            success: false,
                                            error: {
                                                errorMessage: error
                                            }
                                        })
                                }
                            }
                        } else if (listing[0].inventoryType == 'recipe') {

                            let receiverRecipeData;
                            try {
                                receiverRecipeData = await InventoryQueries.getReceiverRecipeData(address, listing[0].idRecipe, listing[0].quantity)
                            } catch (error) {
                                logger.error(`Error in RecipeQueries.subRecipeByIdRecipeAndAddress: ${Utils.printErrorLog(error)}`)
                                return res
                                    .status(401)
                                    .json({
                                        success: false,
                                        error: {
                                            errorMessage: error
                                        }
                                    })
                            }

                            if (receiverRecipeData.length == 0) {
                                try {
                                    await InventoryQueries.updatedRecipeInstanceByAddress('create', address, listing[0].idRecipe, listing[0].quantity)
                                } catch (error) {
                                    logger.error(`Error in InventoryQueries.updatedRecipeInstanceByAddress: ${Utils.printErrorLog(error)}`)
                                    return res
                                        .status(401)
                                        .json({
                                            success: false,
                                            error: {
                                                errorMessage: error
                                            }
                                        })
                                }
                            } else {
                                try {
                                    await RecipeQueries.addRecipeByIdRecipeAndAddress(address, listing[0].idRecipe, listing[0].quantity);
                                } catch (error) {
                                    logger.error(`Error in RecipeQueries.addRecipeByIdRecipesendrecipeAndAddress: ${Utils.printErrorLog(error)}`)
                                    return res
                                        .status(401)
                                        .json({
                                            success: false,
                                            error: {
                                                errorMessage: error
                                            }
                                        })
                                }
                            }
                        } else if (listing[0].inventoryType == 'tool') {
                            await InventoryQueries.changeToolOwner(listing[0].idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                        }

                        await MarketInventoryQueries.subAncien(address, listing[0].totalPrice);
                        if(serverConfig.routes.fee.marketplaceFee){
                            let quantityToAdd = listing[0].totalPrice - (listing[0].totalPrice * serverConfig.routes.fee.marketplaceFeeValue);
                            await MarketInventoryQueries.addAncien(listing[0].owner, quantityToAdd);
                        }else{
                            await MarketInventoryQueries.addAncien(listing[0].owner, listing[0].totalPrice);
                        }

                        totalQuantity += listing[0].quantity;
                        totalPrice += listing[0].totalPrice;

                        listingResponse[0].bought = 1;
                    }
                    listings.push(listingResponse[0]);

                    logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);
                }
                storage = await MarketInventoryQueries.getResources(address);
                ancien = storage.ancien;

                logger.info("buyInventory End");
            }

            logger.debug(`listings: ${JSON.stringify(listings)}`);

        } catch (error) {
            logger.error(`error in marketInventoryService buyResourceAndInventory: ${Utils.printErrorLog(error)}`);
        }

        logger.info("buyResourceAndInventory END");

        return {
            hasAlreadyBoughtInventory,
            listings,
            totalQuantity,
            totalPrice,
            ancien
        }
    }

    static async buyInventoryPvp(address, buyIds) {
        logger.debug(`buyResourceAndInventory service start`);

        let listing;
        let listings = [];
        let listingResponse;
        let totalQuantity = 0;
        let totalPrice = 0;
        let ancien;
        let hasAlreadyBoughtInventory = false;
        let storage,response;

        let responseBuy;

        try {
            logger.info("buyInventoryPVP Start");

            let user
            try {
                user = await UserQueriesPvp.getUser(address)
            } catch (error) {
                logger.error(`UserQueriesPvp.getUser error: ${Utils.printErrorLog(error)}`);
                throw(error)
            }
            if(user.length == 0 ) throw{errorMessage:"The user that is trying to buy a pvp AD does not have a pvp Account"}

            for (let i = 0; i < buyIds.length; i++) {
                storage = await MarketInventoryQueries.getResources(address);

                listing = await MarketInventoryQueries.getMarketplaceInventorySingleListingPvp(buyIds[i], address);
                if (listing.length == 0) {
                    hasAlreadyBoughtInventory = true;
                    continue;
                }

                listingResponse = MarketInventoryInterface.buildFinalResponseInventoryPvp(listing);

                logger.debug(`final Response is : ${JSON.stringify(listingResponse)}`)

                if (listing[0].totalPrice <= storage.ancien) {

                    responseBuy = await MarketInventoryQueries.buyAd(buyIds[i], address);

                    if (responseBuy.changedRows == 0) {
                        hasAlreadyBoughtInventory = true;
                        continue;
                    }

                    switch (listing[0].inventoryType) {
                        case 'item':
        
                            try {
                                response = await InventoryQueriesPvp.getItemGivenIdItem(address, listing[0].idItem);
                            } catch (error) {
                                logger.error(`InventoryQueriesPvp.getItemGivenIdItem error: ${Utils.printErrorLog(error)}`);
                                throw error;
                            }
                            if (response.length == 0) {
                                try {
                                    response = await InventoryQueriesPvp.newItem(address, listing[0].idItem, listing[0].quantity);
                                } catch (error) {
                                    logger.error(`InventoryQueriesPvp.newItem error: ${Utils.printErrorLog(error)}`);
                                    throw error;
                                }
        
                            } else {
                                try {
                                    response = await InventoryQueriesPvp.addItems(address, listing[0].idItem, listing[0].quantity);
                                } catch (error) {
                                    logger.error(`InventoryQueriesPvp.addItems error: ${Utils.printErrorLog(error)}`);
                                    throw error;
                                }
                                if (response[1].changedRows != 1) {
                                    throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                        But also remember that we are logging everything.
                                        Unauthorized access is illegal.`
                                    )
                                }
                            }
                            break;
        
                        case 'recipe':
                            try {
                                response = await InventoryQueriesPvp.getRecipeGivenIdRecipe(address, listing[0].idRecipe);
                            } catch (error) {
                                logger.error(`InventoryQueriesPvp.getRecipeGivenIdRecipe error: ${Utils.printErrorLog(error)}`);
                                throw error;
                            }
                            logger.debug(`getrecipe response : ${response}`);
                            if (response.length == 0) {
                                try {
                                    response = await InventoryQueriesPvp.newRecipe(address, listing[0].idRecipe, listing[0].quantity);
                                } catch (error) {
                                    logger.error(`InventoryQueriesPvp.newRecipe error: ${Utils.printErrorLog(error)}`);
                                    throw error;
                                }
        
                            } else {
                                try {
                                    response = await InventoryQueriesPvp.addRecipes(address, listing[0].idRecipe, listing[0].quantity);
                                } catch (error) {
                                    logger.error(`InventoryQueriesPvp.addRecipes error: ${Utils.printErrorLog(error)}`);
                                    throw error;
                                }
                                if (response[1].changedRows != 1) {
                                    throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                            But also remember that we are logging everything.
                                            Unauthorized access is illegal.`
                                    )
                                }
                            }
                            break;
        
                        case 'gear':
        
                            try {
                                response = await InventoryQueriesPvp.changeGearOwner(listing[0].idGearInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                            } catch (error) {
                                logger.error(`InventoryQueriesPvp.changeToolOwner error: ${Utils.printErrorLog(error)}`);
                                throw error;
                            }
        
                            break;
        
                            case 'card':
        
                                try {
                                    response = await InventoryQueriesPvp.changeCardOwner(listing[0].idCardInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                                } catch (error) {
                                    logger.error(`InventoryQueriesPvp.changeCardOwner error: ${Utils.printErrorLog(error)}`);
                                    throw error;
                                }
            
                                break;
        
        
                    }

                    await MarketInventoryQueries.subAncien(address, listing[0].totalPrice);
                    if(serverConfig.routes.fee.marketplaceFee){
                        let quantityToAdd = listing[0].totalPrice - (listing[0].totalPrice * serverConfig.routes.fee.marketplaceFeeValue);
                        await MarketInventoryQueries.addAncien(listing[0].owner, quantityToAdd);
                    }else{
                        await MarketInventoryQueries.addAncien(listing[0].owner, listing[0].totalPrice);
                    }

                    totalQuantity += listing[0].quantity;
                    totalPrice += listing[0].totalPrice;

                    listingResponse[0].bought = 1;
                }
                listings.push(listingResponse[0]);

                logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);
            }
            storage = await MarketInventoryQueries.getResources(address);
            ancien = storage.ancien;

            logger.info("buyInventory End");
        

            logger.debug(`listings: ${JSON.stringify(listings)}`);

        } catch (error) {
            logger.error(`error in marketInventoryService buyResourceAndInventory: ${Utils.printErrorLog(error)}`);
        }

        logger.info("buyResourceAndInventory END");

        return {
            hasAlreadyBoughtInventory,
            listings,
            totalQuantity,
            totalPrice,
            ancien
        }
    }

    static async getTotalListing(address, type, id, level) {
        logger.debug(`getTotalListing service start`);

        let listing;
        let listingResponse;

        try {
            listing = await MarketInventoryQueries.getTotalListing(address, type, id, level);

            logger.debug(`listing: ${JSON.stringify(listing)}`);

            if (type == 'resource') listingResponse = MarketInventoryInterface.buildFinalResourceResponse(listing);
            else listingResponse = MarketInventoryInterface.buildFinalResponse(listing);

            logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        } catch (error) {
            logger.error(`error in marketInventoryService getTotalListing: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let toolIds = []
        for (let inventory of listingResponse) {
            if (inventory.inventoryType === 'tool') {
                toolIds.push(inventory.idToolInstance)
            }
        }
        if (toolIds.length != 0) {
            toolIds = toolIds.join(', ')
            logger.info(`toolIds: ${toolIds}`)
            let toolBonuses
            try {
                toolBonuses = await ToolService.getToolBonuses(toolIds)
            } catch (error) {
                logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                throw error
            }
            logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

            for (let inventory of listingResponse) {
                inventory.bonuses = toolBonuses[inventory.idToolInstance] ? toolBonuses[inventory.idToolInstance].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        logger.info("getTotalListing END");

        return {
            listings: listingResponse,
        }
    }

    static async getTotalListingPvpService(address, type, id, level) {
        logger.debug(`getTotalListingPvpService service start`);

        let listing;
        let listingResponse ;

        try {
            listing = await MarketInventoryQueries.getAllListingPvp(address, type);
            logger.debug(`listing: ${JSON.stringify(listing)}`);
        } catch (error) {
            logger.error(`error in marketInventoryService getTotalListing: ${Utils.printErrorLog(error)}`);
            throw error
        }

        try {
            listingResponse = await this.buildFinalAdResponsePvp(listing);
            logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);
        } catch (error) {
            logger.error(`error in marketInventoryService buildFinalAdResponsePvp: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let listingResponseFiltered 

        switch (type) {
            case "card":
                listingResponseFiltered = listingResponse.filter(listing => (listing.idCard === id && listing.level === level));
                break;
            case "gear":
                listingResponseFiltered = listingResponse.filter(listing => (listing.idGear === id && listing.level === level));
                break;
            case "item":
                listingResponseFiltered = listingResponse.filter(listing => (listing.idItem === id));
                break;
            case "recipe":
                listingResponseFiltered = listingResponse.filter(listing => (listing.idRecipe === id));
                break; 
        }
        


        logger.info("getTotalListing END");

        return {
            listings: listingResponseFiltered,
        }
    }

    static async buildFinalAdResponsePvp(listing){
        let final = []
        for (let singleListing of listing) {
            let ad ={}
            ad.inventoryType = singleListing.inventoryType;
            ad.quantity = singleListing.quantity;
            ad.price = singleListing.price;
            ad.totalPrice = singleListing.totalPrice;
            ad.endingTime = singleListing.endingTime;
            ad.saleTime = singleListing.saleTime;
            ad.id = singleListing.idMarketplaceInventory;
            ad.status = singleListing.status;
            ad.bought = 0;
            ad.market = "pvp";
            ad.idGearInstance = singleListing.idGearInstance;
            ad.idCardInstance = singleListing.idCardInstance;
            switch (singleListing.inventoryType) {
                case "item":
                    let itemInfo
                    try {
                        itemInfo = await ItemQueriesPvp.getItemGivenIdItem(singleListing.idItem)
                        logger.debug(`Item infos retrieved ${JSON.stringify(itemInfo)}`)
                    } catch (error) {
                        logger.error(`error in ItemQueriesPvp getItemGivenIdItem: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    if(itemInfo.length != 1) throw ("Could not retireve item Infos")
                    itemInfo = itemInfo[0]
                    ad.name = itemInfo.name;
                    ad.image = itemInfo.image;
                    ad.idItem = singleListing.idItem
                    break;
                case "recipe":
                    let recipeInfo
                    try {
                        recipeInfo = await RecipeQueriesPvp.getRecipeGivenIdRecipe(singleListing.idRecipe)
                        logger.debug(`Recipe infos retrieved ${JSON.stringify(recipeInfo)}`)
                    } catch (error) {
                        logger.error(`error in RecipeQueriesPvp getRecipeGivenIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    if(recipeInfo.length != 1) throw ("Could not retireve recipe Infos")
                    recipeInfo = recipeInfo[0]
                    ad.name = recipeInfo.name;
                    ad.image = recipeInfo.image;
                    ad.idRecipe = singleListing.idRecipe;
                    break;
                case "gear":
                    let gearInfo
                    try {
                        gearInfo = await GearQueriesPvp.getGearGivenIdGearInstance(singleListing.idGearInstance)
                        logger.debug(`Gear infos retrieved ${JSON.stringify(gearInfo)}`)
                    } catch (error) {
                        logger.error(`error in GearQueriesPvp getGearGivenIdGearInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    if(gearInfo.length != 1) throw ("Could not retireve gear Infos")
                    gearInfo = gearInfo[0]
                    ad.name = gearInfo.name + " + " + gearInfo.level;
                    ad.level = gearInfo.level;
                    ad.image = gearInfo.image;
                    ad.gearType = gearInfo.type;
                    ad.idGear = gearInfo.idGear
                    break;
                case "card":
                    let cardInfo
                    try {
                        cardInfo = await CardQueriesPvp.getCardGivenIdCardInstance(singleListing.idCardInstance)
                        logger.debug(`Card infos retrieved ${JSON.stringify(cardInfo)}`)
                    } catch (error) {
                        logger.error(`error in CardQueriesPvp getCardGivenIdCardInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    if(cardInfo.length != 1) throw ("Could not retireve card Infos")
                    cardInfo = cardInfo[0]
                    ad.name = cardInfo.name + " + " + cardInfo.level;
                    ad.level = cardInfo.level
                    ad.image = cardInfo.image;
                    ad.gearType = cardInfo.type;
                    ad.cardCategory = cardInfo.category;
                    ad.cardRarity = cardInfo.rarity;
                    ad.idCard = cardInfo.idCard;
                    break;
            }
            final.push(ad)
        }
        return final
    }

    static async getAllListing(address, status, page, inventoryType, name) {
        logger.debug(`getAllListing service start`);

        let listing;
        let listingResponse;
        let storage;
        let nextPage;

        try {
            listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, MAX_VIEW * page, status, inventoryType, name);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAllListing error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        //check if a page that doesn't exist is requested then return the first page
        if (listing[0].length == 0) {
            page = 0;
            try {
                listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, MAX_VIEW * page, status, inventoryType, name);
            } catch (error) {
                logger.error(`MarketInventoryQueries.getAllListing error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        logger.debug(`listing: ${JSON.stringify(listing)}`);

        listing[0] = this.changeStatusForOwner(listing[0], address);

        listingResponse = MarketInventoryInterface.buildFinalResponse(listing[0]);
        logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        try {
            storage = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        storage = this.buildResourcesResponse(storage);
        logger.debug(`storage: ${JSON.stringify(storage)}`);

        nextPage = (listingResponse.length == MAX_VIEW) && (listing[1][0].counter > MAX_VIEW * (page + 1)) ? true : false;
        logger.debug(`nextPage: ${JSON.stringify(nextPage)}`);

        logger.info("getAllListing END");

        return {
            listings: listingResponse,
            storage,
            nextPage
        }
    }

    static async getPersonalHistory(address, inventoryType, name, page) {
        logger.debug(`getPersonalHistory service start`);

        let listing;
        let listingResponse;
        let inventory;
        let nextPage;

        try {
            listing = await MarketInventoryQueries.getPersonalHistory(address, MAX_VIEW, MAX_VIEW * page, inventoryType, name);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getPersonalHistory error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        //check if a page that doesn't exist is requested then return the first page
        if (listing[0].length == 0) {
            page = 0;
            try {
                listing = await MarketInventoryQueries.getPersonalHistory(address, MAX_VIEW, MAX_VIEW * page, inventoryType, name);
            } catch (error) {
                logger.error(`MarketInventoryQueries.getPersonalHistory error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        logger.debug(`listing: ${JSON.stringify(listing)}`);

        listingResponse = MarketInventoryInterface.buildFinalResponse(listing[0]);
        logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        try {
            inventory = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        inventory = this.buildResourcesResponse(inventory);
        logger.debug(`storage: ${JSON.stringify(inventory)}`);

        nextPage = (listingResponse.length == MAX_VIEW) && (listing[1][0].counter > MAX_VIEW * (page + 1)) ? true : false;
        logger.debug(`nextPage: ${JSON.stringify(nextPage)}`);

        logger.info("getPersonalHistory END");

        return {
            listings: listingResponse,
            inventory,
            nextPage
        }
    }

    static async createAd(address, inventoryType, id, price, duration, quantity) {
        logger.debug(`createAd service start`);

        id = parseInt(id);
        price = parseFloat(price);
        quantity = parseInt(quantity);
        duration = parseInt(duration);

        let type = 1; // this is what to replicate again
        let item, response, recipe, tool

        let totalPrice;
        let resources;
        let balance;

        let now;
        let endingTime;
        let creationTime;

        let durationMilliSec;

        let responseBalance;
        let responseCreateAd;

        let newListing;
        let inventory;

        let adAllowed;
        let adOnSale;

        let editElements = [], removeElements = []
        let quantityUpdated


        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAccountListingGivenStatus error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (adOnSale.length >= MAX_AD_NUMBER) {
            logger.warn(`Max number of ads reached, addOnSale: ${JSON.stringify(adOnSale)}`);
            throw {
                errorMessage: "Max number of ads reached"
            };
        }

        logger.debug(`adOnSale: ${JSON.stringify(adOnSale)}`);

        try {
            resources = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`resources: ${JSON.stringify(resources)}`);

        if (inventoryType == 'item') {
            //check item e quantity
            //sub
            try {
                item = await InventoryQueries.getItemGivenIdItemInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueries.getItemGivenIdItemInstance error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getItem response : ${JSON.stringify(item)}`);

            if (item.length == 0) {
                throw new Error('The item you are trying to sell does not belong to you')
            }

            item = item[0];

            if (item.quantity < quantity) {
                throw new Error('Not enough items to sell');
            }

            try {
                response = await InventoryQueries.subItem(address, id, quantity)
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.subItem error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`subItemResponse : ${JSON.stringify(response)}`);


        }

        if (inventoryType == 'recipe') {
            //check item e quantity
            //sub
            try {
                recipe = await InventoryQueries.getRecipeGivenIdRecipeInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueries.getRecipeGivenIdRecipe error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getRecipe response : ${JSON.stringify(recipe)}`);

            if (recipe.length == 0) {
                throw new Error('The recipe you are trying to sell does not belong to you')
            }

            recipe = recipe[0];

            if (recipe.quantity < quantity) {
                throw new Error('Not enough recipes to sell');
            }

            try {
                response = await InventoryQueries.subRecipe(address, id, quantity)
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.subRecipe error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`subRecipe subbed response : ${JSON.stringify(response)}`);
        }

        if (inventoryType == 'tool') {
            if (quantity > 1) {
                throw new Error(`Quantity cannot be bigger than 1 when selling a tool`)
            }
            try {
                tool = await InventoryQueries.getToolGivenIdToolInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueries.getToolGivenIdToolInstance error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getToolGivenIdToolInstance response : ${JSON.stringify(recipe)}`);

            if (tool.length == 0) {
                throw new Error('The tool you are trying to sell does not belong to you')
            }

            tool = tool[0];

            try {
                response = await InventoryQueries.toolFakeProperty(id);
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.toolFakeProperty error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            logger.debug(`toolFakeProperty : ${JSON.stringify(response)}`);
            logger.debug('tool subbed')
        }


        totalPrice = price * quantity;

        logger.debug(`totalPrice: ${totalPrice}`);

        durationMilliSec = duration * 1000;

        now = new Date().getTime();

        let ending = now + durationMilliSec;

        creationTime = new Date().toISOString().slice(0, -1);
        endingTime = new Date(ending).toISOString().slice(0, -1);

        logger.debug(`durationMillisec: ${durationMilliSec}, now: ${now}, ending: ${ending}, creationTime: ${creationTime}, endingTime: ${endingTime}`);

        switch (inventoryType) {
            case 'item':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdItem(address, item.idItem, quantity, price, totalPrice, creationTime, endingTime);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdItem error:${Utils.printErrorLog(error)}`);
                    console.log(error);
                    throw error;
                }

                try {
                    quantityUpdated = await ItemQueries.getQuantityByIdItemInstanceForSell(id)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getQuantityByIdItemInstanceForSell: ${Utils.printErrorLog(error)}`)
                    throw error;
                }

                if (quantityUpdated?.length > 0) {
                    editElements.push({
                        id,
                        type: 'item',
                        quantity: quantityUpdated[0].quantity
                    })
                } else {
                    removeElements.push({
                        id,
                        type: 'item'
                    })
                }



                break;

            case 'recipe':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdRecipe(address, recipe.idRecipe, quantity, price, totalPrice, creationTime, endingTime);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdRecipe error: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                try {
                    quantityUpdated = await RecipeQueries.getQuantityGivenIdRecipeInstanceForSell(id)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getQuantityGivenIdRecipeInstanceForSell: ${Utils.printErrorLog(error)}`)
                    throw error;
                }
                if (quantityUpdated?.length > 0) {
                    editElements.push({
                        id,
                        type: 'recipe',
                        quantity: quantityUpdated[0].quantity
                    })
                } else {
                    removeElements.push({
                        id,
                        type: 'recipe'
                    })
                }

                break;

            case 'tool':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdTool(address, tool.idToolInstance, quantity, price, totalPrice, creationTime, endingTime);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdTool error: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                removeElements.push({
                    id,
                    type: 'tool'
                })


                break;
        }

        inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]



        //check affectedRows == 1
        logger.debug(`responseCreateAd: ${JSON.stringify(responseCreateAd)}`);

        newListing = await MarketInventoryQueries.getAccountListing(address, 0);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);

        newListing = MarketInventoryInterface.buildFinalResponse(newListing);

        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAccountListingGivenStatus error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        adAllowed = (adOnSale.length < 25) ? true : false;

        logger.debug(`adAllowed: ${adAllowed}`);

        logger.info(`createAd response: ${JSON.stringify({
            listings: newListing,
            inventory,
            adAllowed
        })
            }`);

        logger.info("createAd END");

        return {
            listings: newListing,
            inventory: inventory,
            adAllowed
        }
    }

    static async createAdPvp(address, inventoryType, id, price, duration, quantity) {
        logger.debug(`createAd service start`);

        id = parseInt(id);
        price = parseFloat(price);
        quantity = parseInt(quantity);
        duration = parseInt(duration);
        let isPvp = 1;

        let type = 1; // this is what to replicate again
        let item, response, recipe, card , gear

        let totalPrice;
        let resources;
        let balance;

        let now;
        let endingTime;
        let creationTime;

        let durationMilliSec;

        let responseBalance;
        let responseCreateAd;

        let newListing;
        let inventory;

        let adAllowed;
        let adOnSale;

        let editElements = [], removeElements = []
        let quantityUpdated


        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAccountListingGivenStatus error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (adOnSale.length >= MAX_AD_NUMBER) {
            logger.warn(`Max number of ads reached, addOnSale: ${JSON.stringify(adOnSale)}`);
            throw {
                errorMessage: "Max number of ads reached"
            };
        }

        logger.debug(`adOnSale: ${JSON.stringify(adOnSale)}`);

        try {
            resources = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`resources: ${JSON.stringify(resources)}`);

        if (inventoryType == 'item') {
            //check item e quantity
            //sub
            try {
                item = await InventoryQueriesPvp.getItemGivenIdItemInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueries.getItemGivenIdItemInstance error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getItem response : ${JSON.stringify(item)}`);

            if (item.length == 0) {
                throw new Error('The item you are trying to sell does not belong to you')
            }

            item = item[0];

            if (item.quantity < quantity) {
                throw new Error('Not enough items to sell');
            }

            try {
                response = await InventoryQueriesPvp.subItem(address, id, quantity)
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.subItem error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`subItemResponse : ${JSON.stringify(response)}`);


        }

        if (inventoryType == 'recipe') {
            //check item e quantity
            //sub
            try {
                recipe = await InventoryQueriesPvp.getRecipeGivenIdRecipeInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueries.getRecipeGivenIdRecipe error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getRecipe response : ${JSON.stringify(recipe)}`);

            if (recipe.length == 0) {
                throw new Error('The recipe you are trying to sell does not belong to you')
            }

            recipe = recipe[0];

            if (recipe.quantity < quantity) {
                throw new Error('Not enough recipes to sell');
            }

            try {
                response = await InventoryQueriesPvp.subRecipe(address, id, quantity)
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.subRecipe error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`subRecipe subbed response : ${JSON.stringify(response)}`);
        }

        
        if (inventoryType == 'gear') {
            if (quantity > 1) {
                throw new Error(`Quantity cannot be bigger than 1 when selling a gear`)
            }
            try {
                gear = await InventoryQueriesPvp.getGearGivenIdGearInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueriesPvp.getGearGivenIdGearInstance error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getGearGivenIdGearInstance response : ${JSON.stringify(gear)}`);

            if (gear.length == 0) {
                throw new Error('The gear you are trying to sell does not belong to you')
            }

            gear = gear[0];

            try {
                response = await InventoryQueriesPvp.gearFakeProperty(id);
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueries.toolFakeProperty error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            logger.debug(`gearFakeProperty : ${JSON.stringify(response)}`);
            logger.debug('gear subbed')
        }

        if (inventoryType == 'card') {
            if (quantity > 1) {
                throw new Error(`Quantity cannot be bigger than 1 when selling a card`)
            }
            try {
                card = await InventoryQueriesPvp.getCardGivenIdCardInstance(address, id);
            } catch (error) {
                logger.error(`InventoryQueriesPvp.getCardGivenIdCardInstance error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`getCardGivenIdCardInstance response : ${JSON.stringify(card)}`);

            if (card.length == 0) {
                throw new Error('The card you are trying to sell does not belong to you')
            }

            card = card[0];

            try {
                response = await InventoryQueriesPvp.cardFakeProperty(id);
                if (response.changedRows != 1) {
                    logger.error(`EXPIRATION is failed, responseBalance: ${response}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`InventoryQueriesPvp.cardFakeProperty error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            logger.debug(`cardFakeProperty : ${JSON.stringify(response)}`);
            logger.debug('card subbed')
        }


        totalPrice = price * quantity;

        logger.debug(`totalPrice: ${totalPrice}`);

        durationMilliSec = duration * 1000;

        now = new Date().getTime();

        let ending = now + durationMilliSec;

        creationTime = new Date().toISOString().slice(0, -1);
        endingTime = new Date(ending).toISOString().slice(0, -1);

        logger.debug(`durationMillisec: ${durationMilliSec}, now: ${now}, ending: ${ending}, creationTime: ${creationTime}, endingTime: ${endingTime}`);

        switch (inventoryType) {
            case 'item':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdItem(address, item.idItem, quantity, price, totalPrice, creationTime, endingTime, isPvp);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdItem error:${Utils.printErrorLog(error)}`);
                    console.log(error);
                    throw error;
                }

                try {
                    quantityUpdated = await ItemQueriesPvp.getQuantityByIdItemInstanceForSell(id)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getQuantityByIdItemInstanceForSell: ${Utils.printErrorLog(error)}`)
                    throw error;
                }

                if (quantityUpdated?.length > 0) {
                    editElements.push({
                        id,
                        type: 'item',
                        quantity: quantityUpdated[0].quantity
                    })
                } else {
                    removeElements.push({
                        id,
                        type: 'item'
                    })
                }



                break;

            case 'recipe':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdRecipe(address, recipe.idRecipe, quantity, price, totalPrice, creationTime, endingTime,isPvp);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdRecipe error: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                try {
                    quantityUpdated = await RecipeQueriesPvp.getQuantityGivenIdRecipeInstanceForSell(id)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getQuantityGivenIdRecipeInstanceForSell: ${Utils.printErrorLog(error)}`)
                    throw error;
                }
                if (quantityUpdated?.length > 0) {
                    editElements.push({
                        id,
                        type: 'recipe',
                        quantity: quantityUpdated[0].quantity
                    })
                } else {
                    removeElements.push({
                        id,
                        type: 'recipe'
                    })
                }

                break;

            case 'gear':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdGear(address, id, quantity, price, totalPrice, creationTime, endingTime, isPvp);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdGear error: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                removeElements.push({
                    id,
                    type: 'gear'
                })


                break;
            case 'card':
                try {
                    responseCreateAd = await MarketInventoryQueries.createAdCard(address, id, quantity, price, totalPrice, creationTime, endingTime,isPvp);
                } catch (error) {
                    logger.error(`MarketInventoryQueries.createAdCard error: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                removeElements.push({
                    id,
                    type: 'card'
                })


                break;
        }

        inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]



        //check affectedRows == 1
        logger.debug(`responseCreateAd: ${JSON.stringify(responseCreateAd)}`);

        newListing = await MarketInventoryQueries.getAccountListing(address, 0);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);

        newListing = MarketInventoryInterface.buildFinalResponse(newListing);

        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAccountListingGivenStatus error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        adAllowed = (adOnSale.length < 25) ? true : false;

        logger.debug(`adAllowed: ${adAllowed}`);

        logger.info(`createAd response: ${JSON.stringify({
            listings: newListing,
            inventory,
            adAllowed
        })
            }`);

        logger.info("createAd END");

        return {
            listings: newListing,
            inventory: inventory,
            adAllowed
        }
    }

    static async buyAd(address, id, filter, page) {
        logger.debug(`buyAd service start`);


        let status = 1;

        let listing;
        let buyerInfo;
        let nextPage;
        let inventory;
        let response;
        let responseBuyAd;
        let listingResponse;
        let responseAddBalance;
        let responseSubBalance;
        let inventoryType;

        try {
            listing = await MarketInventoryQueries.getSingleListing(id);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getSingleListing error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (listing.length == 0) {
            logger.error(`ad doesn't exist, id: ${id}`);
            throw {
                errorMessage: "The ad doesn't exist"
            };
        }

        if(listing[0].isPvp){
            let user
            try {
                user = await UserQueriesPvp.getUser(address)
            } catch (error) {
                logger.error(`UserQueriesPvp.getUser error: ${Utils.printErrorLog(error)}`);
                throw(error)
            }
            if(user.length == 0 ) throw{errorMessage:"The user that is trying to buy a pvp AD does not have a pvp Account"}
        }

        logger.debug(`listing: ${JSON.stringify(listing)}`);

        inventoryType = listing[0].inventoryType;
        page--;
        //AD NOT ON SALE
        if (listing[0].status != 1) {
            logger.debug(`ad not onSale, id: ${id}`);

            try {
                listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, page * MAX_VIEW, status, inventoryType, filter);
            } catch (error) {
                logger.error(`MarketInventoryQueries.getAllListing error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            if (listing[0].length == 0) {
                listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, 0, status, inventoryType, filter);

            }

            logger.debug(`listing: ${JSON.stringify(listing)}`);

            listing[0] = this.changeStatusForOwner(listing[0], address);
            listingResponse = MarketInventoryInterface.buildFinalResponse(listing[0]);
            logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

            try {
                inventory = await MarketInventoryQueries.getResources(address);
            } catch (error) {
                logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            inventory = this.buildResourcesResponse(inventory);
            logger.debug(`inventory: ${JSON.stringify(inventory)}`);


            nextPage = (listingResponse.length == MAX_VIEW) && (listing[1][0].counter > MAX_VIEW) ? true : false;
            logger.debug(`nextPage: ${nextPage}`);

            logger.info(`buyAd not OnSale END`);

            return {
                success: false,
                data: {
                    listings: listingResponse,
                    inventory,
                    nextPage
                },
                error: {
                    errorCode: 0,
                    errorMessage: "ad not onSale"
                }
            }
        }

        //AD ON SALE
        logger.debug(`listing: ${JSON.stringify(listing)}`);

        if (listing[0].owner == address) {
            logger.error(`you are the ad's owner, owner: ${listing.owner}, address: ${address}`);

            throw {
                errorCode: 2,
                errorMessage: "you are the ad's owner"
            };
        }

        let endingTimeMillisec = new Date(listing[0].endingTime).getTime();
        let nowTime = new Date().getTime();

        if (endingTimeMillisec < nowTime) {
            logger.debug(`ad is expired, id: ${id}, endingTimeMillisec: ${endingTimeMillisec}, nowTime: ${nowTime}`);

            throw {
                errorMessage: "ad is expired"
            };
        }

        listing = listing[0];

        logger.debug(`buyerInfo: ${JSON.stringify(buyerInfo)}`);
        try {
            buyerInfo = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        if (buyerInfo.ancien < listing.totalPrice) {
            logger.warn(`Not enough balance: ${buyerInfo.ancien}, totalPrice: ${listing.totalPrice}`);

            throw {
                errorMessage: "Not enough balance"
            };
        }

        //Starting to update marketplace
        try {
            responseBuyAd = await MarketInventoryQueries.buyAd(id, address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.buyAd error: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        if (responseBuyAd.changedRows != 1) {
            logger.error(`buyAd is failed, responseBuyAd: ${responseBuyAd}`);
            return {
                success: false,
                error: {
                    errorCode: 0,
                    errorMessage: "buyAd is failed"
                }
            };
        }


        try {
            responseSubBalance = await MarketInventoryQueries.subAncien(address, listing.totalPrice);
        } catch (error) {
            logger.error(`MarketInventoryQueries.subAncien error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`responseSubBalance: ${JSON.stringify(responseSubBalance)}`);

        if (responseSubBalance.changedRows != 1) {
            logger.error(`responseSubBalance: ${JSON.stringify(responseSubBalance)}`);

            return {
                success: false,
                error: {
                    errorCode: 1,
                    errorMessage: "responseSubBalance is failed"
                }
            };
        }


        try {
            responseAddBalance = await MarketInventoryQueries.addAncien(listing.owner, listing.totalPrice);
        } catch (error) {
            logger.error(`MarketInventoryQueries.addAncien error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`responseAddBalance: ${JSON.stringify(responseAddBalance)}`);

        if (responseAddBalance.changedRows != 1) {
            logger.error(`responseAddBalance: ${JSON.stringify(responseAddBalance)}`);

            return {
                success: false,
                error: {
                    errorCode: 1,
                    errorMessage: "responseAddBalance is failed"
                }
            };
        }
        if(!listing.isPvp){
            switch (listing.inventoryType) {
                case 'item':

                    try {
                        response = await InventoryQueries.getItemGivenIdItem(address, listing.idItem);
                    } catch (error) {
                        logger.error(`InventoryQueries.getItemGivenIdItem error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }
                    if (response.length == 0) {
                        try {
                            response = await InventoryQueries.newItem(address, listing.idItem, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueries.newItem error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }

                    } else {
                        try {
                            response = await InventoryQueries.addItems(address, listing.idItem, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueries.addItems error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }
                        if (response[1].changedRows != 1) {
                            throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                But also remember that we are logging everything.
                                Unauthorized access is illegal.`
                            )
                        }
                    }
                    break;

                case 'recipe':

                    try {
                        response = await InventoryQueries.getRecipeGivenIdRecipe(address, listing.idRecipe);
                    } catch (error) {
                        logger.error(`InventoryQueries.getRecipeGivenIdRecipe error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }
                    logger.debug(`getrecipe response : ${response}`);
                    if (response.length == 0) {
                        try {
                            response = await InventoryQueries.newRecipe(address, listing.idRecipe, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueries.newRecipe error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }

                    } else {
                        try {
                            response = await InventoryQueries.addRecipes(address, listing.idRecipe, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueries.addRecipes error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }
                        if (response[1].changedRows != 1) {
                            throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                    But also remember that we are logging everything.
                                    Unauthorized access is illegal.`
                            )
                        }
                    }
                    break;

                case 'tool':

                    try {
                        response = await InventoryQueries.changeToolOwner(listing.idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                    } catch (error) {
                        logger.error(`InventoryQueries.changeToolOwner error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }

                    break;


            }
        }else {
            switch (listing.inventoryType) {
                case 'item':

                    try {
                        response = await InventoryQueriesPvp.getItemGivenIdItem(address, listing.idItem);
                    } catch (error) {
                        logger.error(`InventoryQueriesPvp.getItemGivenIdItem error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }
                    if (response.length == 0) {
                        try {
                            response = await InventoryQueriesPvp.newItem(address, listing.idItem, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueriesPvp.newItem error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }

                    } else {
                        try {
                            response = await InventoryQueriesPvp.addItems(address, listing.idItem, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueriesPvp.addItems error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }
                        if (response[1].changedRows != 1) {
                            throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                But also remember that we are logging everything.
                                Unauthorized access is illegal.`
                            )
                        }
                    }
                    break;

                case 'recipe':

                    try {
                        response = await InventoryQueriesPvp.getRecipeGivenIdRecipe(address, listing.idRecipe);
                    } catch (error) {
                        logger.error(`InventoryQueriesPvp.getRecipeGivenIdRecipe error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }
                    logger.debug(`getrecipe response : ${response}`);
                    if (response.length == 0) {
                        try {
                            response = await InventoryQueriesPvp.newRecipe(address, listing.idRecipe, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueriesPvp.newRecipe error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }

                    } else {
                        try {
                            response = await InventoryQueriesPvp.addRecipes(address, listing.idRecipe, listing.quantity);
                        } catch (error) {
                            logger.error(`InventoryQueriesPvp.addRecipes error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }
                        if (response[1].changedRows != 1) {
                            throw new Error(`We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                    But also remember that we are logging everything.
                                    Unauthorized access is illegal.`
                            )
                        }
                    }
                    break;

                case 'gear':

                    try {
                        response = await InventoryQueriesPvp.changeGearOwner(listing.idGearInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                    } catch (error) {
                        logger.error(`InventoryQueriesPvp.changeToolOwner error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }

                    break;

                    case 'card':

                        try {
                            response = await InventoryQueriesPvp.changeCardOwner(listing.idGearInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                        } catch (error) {
                            logger.error(`InventoryQueriesPvp.changeCardOwner error: ${Utils.printErrorLog(error)}`);
                            throw error;
                        }
    
                        break;


            }
        }


        try {
            listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, page * MAX_VIEW, status, inventoryType, filter);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getAllListing error: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (listing[0].length == 0) {
            listing = await MarketInventoryQueries.getAllListing(MAX_VIEW, 0, status, inventoryType, filter);

        }

        listing[0] = this.changeStatusForOwner(listing[0], address);
        logger.debug(`listing: ${JSON.stringify(listing)}`);
        listingResponse = MarketInventoryInterface.buildFinalResponse(listing[0]);
        logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        try {
            inventory = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`MarketInventoryQueries.getResources error: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        inventory = this.buildResourcesResponse(inventory);
        logger.debug(`inventory: ${JSON.stringify(inventory)}`);


        nextPage = (listingResponse.length == MAX_VIEW) && (listing[1][0].counter > MAX_VIEW) ? true : false;
        logger.debug(`nextPage: ${nextPage}`);

        logger.info(`buyAd response: ${JSON.stringify({
            listings: listingResponse,
            inventory,
            nextPage
        })
            }`);

        logger.info(`buyAd END`)

        return {
            success: true,
            data: {
                listings: listingResponse,
                inventory,
                nextPage
            }
        }
    }

    static async cancelAdHandler(listing, address, id) {
        let response, deleteTime, adOnSale, storage, newListing, responseCreateAd, adAllowed;
        let responseCreateItem;
        let responseCreateRecipe;
        let responseItem;
        let responseRecipe;

        if (listing.idItem != null) {

            try {
                responseCreateItem = await InventoryQueries.updatedItemInstanceByAddress('create', listing.owner, listing.idItem, 0);
                console.log("responseCreateItem: ", responseCreateItem)

                responseItem = await ItemQueries.getItemInstanceByAddressAndIdItem(listing.owner, listing.idItem);
                responseItem = await ItemQueries.addItemByIdItemInstanceMarket(responseItem[0].idItemInstance, listing.quantity, listing.idMarketplaceInventory);

                if (responseItem[1].changedRows != 1) {
                    logger.error(`CANCELAD idItem is failed, responseBalance: ${responseItem}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in checkListingStatus item, error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

        }

        if (listing.idRecipe != null) {

            try {
                responseCreateRecipe = await InventoryQueries.updatedRecipeInstanceByAddress('create', listing.owner, listing.idRecipe, 0);
                console.log("[responseCreateRecipe]: ", responseCreateRecipe)

                responseRecipe = await RecipeQueries.getRecipeInstanceByAddressAndIdItem(listing.owner, listing.idRecipe);
                responseRecipe = await RecipeQueries.addRecipeByIdRecipeInstanceMarket(responseRecipe[0].idRecipeInstance, listing.quantity, listing.idMarketplaceInventory);
                if (responseRecipe[1].changedRows != 1) {
                    logger.error(`CANCELAD idRecipe is failed, responseBalance: ${responseRecipe}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in checkListingStatus recipe, error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        if (listing.idToolInstance != null) {
            try {
                response = await InventoryQueries.changeToolOwner(listing.idToolInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                if (response.changedRows != 1) {
                    logger.error(`CANCELAD idToolInstance is failed, responseBalance: ${JSON.stringify(response)}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in InventoryQueries changeToolOwner: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`changeToolOwner response :${response}`);
        }

        deleteTime = new Date().toISOString().slice(0, -1);

        try {
            responseCreateAd = await MarketInventoryQueries.cancelSingleAdStatus(id, deleteTime);
            if (responseCreateAd.changedRows != 1) {
                logger.error(`CANCELAD cancelSingleAdStatus is failed, responseCancelAd: ${response}`);
                throw {
                    errorCode: 189,
                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                    But also remember that we are logging everything.
                    Unauthorized access is illegal.`
                };
            }
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries cancelSingleAdStatus: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`response cancelAd : ${responseCreateAd}`);



        try {
            newListing = await MarketInventoryQueries.getAccountListing(address, 0);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getAccountListing: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);
        newListing = MarketInventoryInterface.buildFinalResponse(newListing);

        try {
            storage = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        storage = this.buildResourcesResponse(storage);


        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getAccountListingGivenStatus: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        adAllowed = (adOnSale.length < 25) ? true : false;
        logger.debug(`adAllowed: ${adAllowed}, adOnSale: ${JSON.stringify(adOnSale)}`);

        return {
            listings: newListing,
            storage,
            adAllowed
        }
    }

    static async cancelAdHandlerPvp(listing, address, id) {
        let response, deleteTime, adOnSale, storage, newListing, responseCreateAd, adAllowed;
        let responseCreateItem;
        let responseCreateRecipe;
        let responseItem;
        let responseRecipe;

        if (listing.idItem != null) {

            try {
                responseCreateItem = await InventoryQueriesPvp.updatedItemInstanceByAddress('create', listing.owner, listing.idItem, 0);
                console.log("responseCreateItem: ", responseCreateItem)

                responseItem = await ItemQueriesPvp.getItemInstanceByAddressAndIdItem(listing.owner, listing.idItem);
                responseItem = await ItemQueriesPvp.addItemByIdItemInstanceMarket(responseItem[0].idItemInstance, listing.quantity, listing.idMarketplaceInventory);

                if (responseItem[1].changedRows != 1) {
                    logger.error(`CANCELAD idItem is failed, responseBalance: ${responseItem}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in checkListingStatus item, error: ${Utils.printErrorLog(error)}`);
                throw error;
            }

        }

        if (listing.idRecipe != null) {

            try {
                responseCreateRecipe = await InventoryQueriesPvp.updatedRecipeInstanceByAddress('create', listing.owner, listing.idRecipe, 0);
                console.log("[responseCreateRecipe]: ", responseCreateRecipe)

                responseRecipe = await RecipeQueriesPvp.getRecipeInstanceByAddressAndIdItem(listing.owner, listing.idRecipe);
                responseRecipe = await RecipeQueriesPvp.addRecipeByIdRecipeInstanceMarket(responseRecipe[0].idRecipeInstance, listing.quantity, listing.idMarketplaceInventory);
                if (responseRecipe[1].changedRows != 1) {
                    logger.error(`CANCELAD idRecipe is failed, responseBalance: ${responseRecipe}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in checkListingStatus recipe, error: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        if (listing.idGearInstance != null) {
            try {
                response = await InventoryQueriesPvp.changeGearOwner(listing.idGearInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                if (response.changedRows != 1) {
                    logger.error(`CANCELAD idGearInstance is failed, responseBalance: ${JSON.stringify(response)}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in InventoryQueries changeGearOwner: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`changeGearOwner response :${response}`);
        }

        if (listing.idCardInstance != null) {
            try {
                response = await InventoryQueriesPvp.changeCardOwner(listing.idCardInstance, serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, address);
                if (response.changedRows != 1) {
                    logger.error(`CANCELAD idCardInstance is failed, responseBalance: ${JSON.stringify(response)}`);
                    throw {
                        errorCode: 189,
                        errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`
                    };
                }
            } catch (error) {
                logger.error(`Error in InventoryQueries changeCardOwner: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            logger.debug(`changeCardOwner response :${response}`);
        }

        deleteTime = new Date().toISOString().slice(0, -1);

        try {
            responseCreateAd = await MarketInventoryQueries.cancelSingleAdStatus(id, deleteTime);
            if (responseCreateAd.changedRows != 1) {
                logger.error(`CANCELAD cancelSingleAdStatus is failed, responseCancelAd: ${response}`);
                throw {
                    errorCode: 189,
                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                    But also remember that we are logging everything.
                    Unauthorized access is illegal.`
                };
            }
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries cancelSingleAdStatus: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        logger.debug(`response cancelAd : ${responseCreateAd}`);



        try {
            newListing = await MarketInventoryQueries.getAccountListing(address, 0);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getAccountListing: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);
        newListing = MarketInventoryInterface.buildFinalResponse(newListing);

        try {
            storage = await MarketInventoryQueries.getResources(address);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        storage = this.buildResourcesResponse(storage);


        try {
            adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        } catch (error) {
            logger.error(`Error in MarketInventoryQueries getAccountListingGivenStatus: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        adAllowed = (adOnSale.length < 25) ? true : false;
        logger.debug(`adAllowed: ${adAllowed}, adOnSale: ${JSON.stringify(adOnSale)}`);

        return {
            listings: newListing,
            storage,
            adAllowed
        }
    }
}
module.exports = { MarketInventoryService }