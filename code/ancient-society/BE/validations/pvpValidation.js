const logger = require("../logging/logger")
const Validator = require("../utils/validator")

class PvpValidation {
    static getInventoryListValidation(req) {
        let address = req.locals.address
        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }
        return {
            success: true
        }
    }
    static craftPvpValidation(req) {
        let address = req.locals.address;
        let idRecipeInstance = req.body.idRecipeInstance;
        let burnGearIds = req.body.burnGearIds
        let burnCardIds = req.body.burnCardIds
        let consumableIds = req.body.consumableIds
        let craftCount = req.body.craftCount

        if (!Validator.validateInput(address, idRecipeInstance, burnGearIds, burnCardIds, consumableIds, craftCount)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipeInstance: ${idRecipeInstance}, burnCardIds: ${JSON.stringify(burnCardIds)}, consumableIds: ${JSON.stringify(consumableIds)}, craftCount: ${craftCount}, burnGearIds: ${JSON.stringify(burnGearIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if (!Validator.isPositiveInteger(idRecipeInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idRecipeInstance is not an integer > 0`
                }
            }
        }
        for (let burnToolId of burnGearIds) {
            if (!Validator.isPositiveInteger(burnToolId)) {
                return {
                    success: false,
                    error: {
                        errorMessage: `burnGearId is not an integer > 0`
                    }
                }
            }
        }
        for (let burnToolId of burnCardIds) {
            if (!Validator.isPositiveInteger(burnToolId)) {
                return {
                    success: false,
                    error: {
                        errorMessage: `burnCardIds is not an integer > 0`
                    }
                }
            }
        }
        if (!Validator.isPositiveInteger(craftCount)) {
            return {
                success: false,
                error: {
                    errorMessage: `craftCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static craftPvpNPCValidation(req) {
        let address = req.locals.address;
        let idRecipe = req.body.idRecipe;
        let burnGearIds = req.body.burnGearIds
        let burnCardIds = req.body.burnCardIds
        let consumableIds = req.body.consumableIds
        let craftCount = req.body.craftCount

        if (!Validator.validateInput(address, idRecipe, burnGearIds, burnCardIds, consumableIds, craftCount)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipeInstance: ${idRecipe}, burnCardIds: ${JSON.stringify(burnCardIds)}, consumableIds: ${JSON.stringify(consumableIds)}, craftCount: ${craftCount}, burnGearIds: ${JSON.stringify(burnGearIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if (!Validator.isPositiveInteger(idRecipe)) {
            return {
                success: false,
                error: {
                    errorMessage: `idRecipe is not an integer > 0`
                }
            }
        }
        for (let burnToolId of burnGearIds) {
            if (!Validator.isPositiveInteger(burnToolId)) {
                return {
                    success: false,
                    error: {
                        errorMessage: `burnGearId is not an integer > 0`
                    }
                }
            }
        }
        for (let burnToolId of burnCardIds) {
            if (!Validator.isPositiveInteger(burnToolId)) {
                return {
                    success: false,
                    error: {
                        errorMessage: `burnCardIds is not an integer > 0`
                    }
                }
            }
        }
        if (!Validator.isPositiveInteger(craftCount)) {
            return {
                success: false,
                error: {
                    errorMessage: `craftCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static openChestPvpValidation(req) {
        let address = req.locals.address;
        let idItemInstance = req.body.idItemInstance
        let openCount = req.body.openCount

        if (!Validator.validateInput(address, idItemInstance, openCount)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, openCount: ${openCount}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if (!Validator.isPositiveInteger(idItemInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idItemInstance is not an integer > 0`
                }
            }
        }
        if (!Validator.isPositiveInteger(openCount)) {
            return {
                success: false,
                error: {
                    errorMessage: `openCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static getInventoryInstanceDataValidation(req) {
        let address = req.locals.address
        let idInventoryInstance = req.body.idInventoryInstance
        let inventoryType = req.body.inventoryType
        if (!Validator.validateInput(address, idInventoryInstance, inventoryType)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idInventoryInstance: ${idInventoryInstance}, inventoryType: ${inventoryType}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }
        if (!Validator.isPositiveInteger(idInventoryInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idInventoryInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }

    static isSignedValidation(req) {
        let address = req.body.address;
        if (!Validator.validateInput(address)) {
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Address is not valid`
                }
            }
        }
        return {
            success: true
        }
    }

    static getUserInfoPvpValidation(req) {
        let address = req.body.address;
        if (!Validator.validateInput(address)) {
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Address is not valid`
                }
            }
        }
        return {
            success: true
        }
    }

    static upgradeGearValidation(req) {
        let address = req.locals.address;
        let idGearInstance = req.body.idGearInstance;
        let consumableIds = req.body.consumableIds


        if (!Validator.validateInput(address, idGearInstance, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idGearInstance: ${idGearInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if (!Validator.isPositiveInteger(idGearInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idGearInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }

    static upgradeCardValidation(req) {
        let address = req.locals.address;
        let idCardInstance = req.body.idCardInstance;
        let consumableIds = req.body.consumableIds


        if (!Validator.validateInput(address, idCardInstance, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idGearInstance: ${idGearInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if (!Validator.isPositiveInteger(idCardInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idGearInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }

    static joinQueueValidation(req) {
        let address = req.locals.address;



        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        
        return {
            success: true
        }
    }

    static leaveQueueValidation(req) {
        let address = req.locals.address;


        if (!Validator.validateInput(address,)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        return {
            success: true
        }
    }

    static checkMatchmakingValidation(req) {
        let address = req.locals.address;


        if (!Validator.validateInput(address,)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        return {
            success: true
        }
    }

    static checkQueueStatusValidation(req) {
        let address = req.locals.address;


        if (!Validator.validateInput(address,)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        return {
            success: true
        }
    }

    static sendCardValidation(req) {
        let addressSender = req.locals.address;
        let addressReceiver = req.body.receiver;
        let idCardInstance = req.body.idCardInstance;

        if(!Validator.validateInput(addressSender, addressReceiver, idCardInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender} ,addressReceiver ${addressReceiver},idItemInstance ${idCardInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }
        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idCardInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idCardInstance is not an integer > 0`
                }
            }
        }
        
        return {
            success: true
        }
    }
    
    static sendGearValidation(req) {
        let addressSender = req.locals.address;
        let addressReceiver = req.body.receiver;
        let idGearInstance = req.body.idGearInstance;

        if(!Validator.validateInput(addressSender, addressReceiver, idGearInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender} ,addressReceiver ${addressReceiver},idGearInstance ${idGearInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }
        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idGearInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idGearInstance is not an integer > 0`
                }
            }
        }
        
        return {
            success: true
        }
    }

    static changeGearValidation(req) {
        let address = req.locals.address;
        let idCardInstance = req.body.idCardInstance;
        let idGearInstance = req.body.idGearInstance;
        let slot = req.body.slot;

        if(!Validator.validateInput(address, idCardInstance, idGearInstance, slot)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${address} ,idCardInstance ${idCardInstance},idGearInstance ${idGearInstance}, slot ${slot}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }

        if(!Validator.isPositiveInteger(idCardInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idCardInstance is not an integer > 0`
                }
            }
        }

        if(!Validator.isPositiveInteger(idGearInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idGearInstance is not an integer > 0`
                }
            }
        }

        let slots = ['weapon', 'shield', 'talisman'];

        if (!slots.includes(slot)) {
            return {
                success: false,
                error: {
                    errorMessage: `Slot type is not correct`
                }
            };
        } 
        
        return {
            success: true
        }
    }

    static unequipGearValidation(req) {
        let address = req.locals.address;
        let idCardInstance = req.body.idCardInstance;
        let idGearInstance = req.body.idGearInstance;

        if(!Validator.validateInput(address, idCardInstance, idGearInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${address} ,idCardInstance ${idCardInstance},idGearInstance ${idGearInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }

        if(!Validator.isPositiveInteger(idCardInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idCardInstance is not an integer > 0`
                }
            }
        }

        if(!Validator.isPositiveInteger(idGearInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idGearInstance is not an integer > 0`
                }
            }
        }
        
        return {
            success: true
        }
    }

    static getCardInstanceValidation(req) {

        let address = req.locals.address;
        let idCardInstance = req.body.idCardInstance;

        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if(!Validator.isPositiveInteger(idCardInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idCardInstance is not an integer > 0`
                }
            }
        }
        
        return {
            success: true
        }
    }

    static getLeaderboardValidation(req) {

        let address = req.locals.address;
        let idLeague = req.body.idLeague;

        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLeague: ${idLeague}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        
        return {
            success: true
        }
    }

    static getWarHistoryValidation(req) {

        let address = req.locals.address;

        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        
        return {
            success: true
        }

    }

    static getWarInstanceHistoryValidation(req) {

        let address = req.locals.address;
        let idWar = req.body.idWar

        if (!Validator.validateInput(address,idWar)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idWar: ${idWar}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if (!Validator.isPositiveInteger(idWar)) {
            return {
                success: false,
                error: {
                    errorMessage: 'idWar  is invalid.'
                }
            }
        }

        
        return {
            success: true
        }

    }

    static setNotificationSeenValidation(req) {

        let address = req.locals.address;
        let idNotificationWar = req.body.idNotificationWar

        if (!Validator.validateInput(address,idNotificationWar)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idNotificationWar: ${idNotificationWar}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if (!Validator.isPositiveInteger(idNotificationWar)) {
            return {
                success: false,
                error: {
                    errorMessage: 'idNotificationWar  is invalid.'
                }
            }
        }

        
        return {
            success: true
        }

    }

    static getNotificationsValidation(req) {

        let address = req.locals.address;

        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }
        
        return {
            success: true
        }

    }

    static createBattleValidation(req) {

        let address = req.locals.address;
        let idWar = req.body.idWar;
        let idArena = req.body.idArena;
        let cards = req.body.cards;
        let legendaryIds = req.body.legendaryIds;

        if (!Validator.validateInput(address, idWar, idArena, cards,legendaryIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idWar: ${idWar}, idArena: ${idArena}, cards: ${cards},legendaryIds:${legendaryIds}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if (!Validator.isPositiveInteger(idWar)) {
            return {
                success: false,
                error: {
                    errorMessage: `idWar is not an integer > 0`
                }
            }
        }

        if (!Validator.isPositiveInteger(idArena)) {
            return {
                success: false,
                error: {
                    errorMessage: `idArena is not an integer > 0`
                }
            }
        }
        if (legendaryIds.length !== 3) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wrong legendaryIds , must be 3 ids'
                }
            }
        }
        let allLegendaries = true
        for(let card of legendaryIds){
            if ((typeof(card) !== 'number' && card !== null)) {
                allLegendaries = false;
            }
            if (typeof card === 'number' && card <= 0) {
                allLegendaries = false;
            }
        }
        if (!allLegendaries) {
            return {
                success: false,
                error: {
                    errorMessage: 'The legendaries must be a number > 0 or null'
                }
            }
        }
        // * Validate the card disposition matrix
        if (cards.length !== 3) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wrong Card disposition, must be 3 matrices'
                }
            }
        }

        for (let disposition of cards) {
            let allCardsAreValid = true;

            for (let rows of disposition) {

                for (let col of rows) {
                    if ((typeof(col) !== 'number' && col !== null)) {
                        allCardsAreValid = false;
                    }

                    if (typeof col === 'number' && col <= 0) {
                        allCardsAreValid = false;
                    }
                }
            
            }

            if (!allCardsAreValid) {
                return {
                    success: false,
                    error: {
                        errorMessage: 'The disposition of cards must be a number > 0 or null'
                    }
                }
            }
            
        }

        return {
            success: true
        }

    }

    static getActiveWarValidation(req) {
        
        let address = req.locals.address;

        if (!Validator.validateInput(address)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        return {
            success: true,
        }

    }

    static getActiveWarInfoValidation(req) {
        
        let address = req.locals.address;
        let idWar = req.body.idWar

        if (!Validator.validateInput(address,idWar)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if (!Validator.isPositiveInteger(idWar)) {
            return {
                success: false,
                error: {
                    errorMessage: 'idWar  is invalid.'
                }
            }
        }

        return {
            success: true,
        }

    }

    static getAffixValidation(req) {
        
        let address = req.locals.address;
        let idWar = req.body.idWar;
        let turn = req.body.turn

        if (!Validator.validateInput(address,idWar,turn)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if (!Validator.isPositiveInteger(idWar)) {
            return {
                success: false,
                error: {
                    errorMessage: 'idWar is invalid.'
                }
            }
        }

        if (!Validator.validateType(turn)) {
            return {
                success: false,
                error: {
                    errorMessage: 'turn is invalid.'
                }
            }
        }

        return {
            success: true,
        }

    }

}

module.exports = { PvpValidation }