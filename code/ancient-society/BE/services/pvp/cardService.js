const logger = require('../../logging/logger');
const random = require('random');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig');
const { InventoryQueries } = require('../../queries/pvp/inventoryQueries');
const { UserQueries } = require('../../queries/pvp/userQueries');
const { PvpHelper } = require('../../helpers/pvp/pvpHelper');
const { ItemQueries } = require('../../queries/pvp/inventory/itemQueries');
const { RecipeQueries } = require('../../queries/pvp/inventory/recipeQueries');
const Validator = require('../../utils/validator');
const { CardQueries } = require('../../queries/pvp/inventory/cardQueries');
const { GearQueries } = require('../../queries/pvp/inventory/gearQueries');

class CardService{
    constructor () {}

    static async upgrade(address, idCardInstance, consumableIds) {
        let response = { done: false, message: '' }
        logger.debug(`Upgrade service START`);

        //upgrade tool history

        // let allBonus
        // try {
        //     allBonus = await ToolQueries.getBonuses(idToolInstance)
        // } catch (error) {
        //     logger.error(`Error in ToolQueries.getBonuses : ${Utils.printErrorLog(error)}`)
        //     throw (error)
        // }
        // logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);

        let upgradeResult;
        let upgradeObjects = [];

        console.log("Morto 1")
        let checkPro
        try {
            checkPro = await CardQueries.checkPropertyToUpgrade(idCardInstance, address)
        } catch (error) {
            logger.error(`Error in CardQueries.checkPropertyToUpgrade: ${Utils.printErrorLog(error)}`);
            throw error
        }

        if (checkPro.length == 0) {
            response.message = 'You haven\'t got that card'
            return response
        }else if (!checkPro[0].isUpgradable) {
            response.message = 'Not upgradable card'
            return response
        }

        let currentLevel = checkPro[0].level;
        let successLevel = checkPro[0].nextLevel;
        let failLevel = checkPro[0].prevLevel;

        console.log("Morto 2")
        let upgradeCardLevel
        try {
            upgradeCardLevel = await CardQueries.getCardLevelByIdCardAndLevel(checkPro[0].idCard, checkPro[0].nextLevel)
        } catch (error) {
            logger.error(`Error in CardQueries.getCardLevelByIdCardAndLevel: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (upgradeCardLevel.length == 0) {
            response.message = 'Not upgradable card'
            return response
        }

        console.log("Morto 3")
        let result
        try {
            result = await CardQueries.checkRequirementsToUpgradeByAddressAndIdCardLevel(address, upgradeCardLevel[0].idCardLevel, consumableIds)
        } catch (error) {
            logger.error(`Error in CardQueries.checkRequirementsToUpgradeByAddressAndIdCardLevel: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (result.length == 0) {
            response.message = 'Not upgradable tool - no requirements'
            return response
        }
        logger.debug(`Requirements retrieved : ${JSON.stringify(result)}`)

        console.log("Morto 4")
        let isUpgradable = result[0].isPointsAllowed
        if (isUpgradable) {
            for (let requirement of result) {
                if (!requirement.isItemAllowed) {
                    isUpgradable = false
                    break
                }
                if(!requirement.isPointsAllowed){
                    isUpgradable = false
                    break
                }
            }
        }
        if (!isUpgradable) {
            response.message = 'Not enough cost to upgrade.'
            return response
        }

        let downgradeAllowed = true
        if (consumableIds[0] == 1 || consumableIds[1] == 1 || consumableIds[2] == 1) {
            downgradeAllowed = false
        }
        if (consumableIds[0] == 2 || consumableIds[1] == 2 || consumableIds[2] == 2) {
            checkPro[0].chanceUpgrade += 10
        }
        if (consumableIds[0] == 6 || consumableIds[1] == 6 || consumableIds[2] == 6) {
            checkPro[0].chanceUpgrade += 5
        }
        if (consumableIds[0] == 7 || consumableIds[1] == 7 || consumableIds[2] == 7) {
            checkPro[0].chanceUpgrade += 15
        }
        let upgradeBool = false
        if (random.int(0, 99) < checkPro[0].chanceUpgrade) {
            upgradeBool = true;
        }
        if (consumableIds[0] == 8 || consumableIds[1] == 8 || consumableIds[2] == 8) {
            upgradeBool = true;
        }
        let reqBool = true;
        if (consumableIds[0] == 9 || consumableIds[1] == 9 || consumableIds[2] == 9) {
            if (upgradeBool == false) {
                reqBool = false;
            }
        }

        let editElements = [], removeElements = []
        
        let lessUpgradeCost = false
        let lessRepairCost;
        // let lessUpCost = allBonus.find(x => x['bonusCode'] === 'LESS_UP_COST');
        // logger.debug(`bonus found ${lessUpCost}`)
        // if (lessUpCost != undefined) {
        //     if (random.int(0, 99) < 25) {
        //         lessUpgradeCost = true;
        //         var boost = lessUpCost.percentageBoost
        //         pointsToSub -= (pointsToSub * boost) / 100
        //         woodToSub -= (woodToSub * boost) / 100
        //         stoneToSub -= (stoneToSub * boost) / 100
        //     }
        // }

        let objectPoints = {};
        
        for (let i = 0; i < result.length; i++) {


            let pointsToSub = result[i].requiredPoints || 0
            if (pointsToSub != 0) {
                objectPoints.resultUpgrade = null;
                objectPoints.idCardInstance = idCardInstance;
                objectPoints.address = address;
                objectPoints.inventoryType = null;
                objectPoints.idItem = null;
                objectPoints.resourceType = 1;
                objectPoints.requiredQuantity = pointsToSub;
                objectPoints.quantityBefore = result[i].pointsBefore;
            }
            if (reqBool) {

                try {
                    await UserQueries.subResources(address, pointsToSub)
                } catch (error) {
                    logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                    throw error
                }
            }

            let object = {};
            object.resultUpgrade = null;
            object.idCardInstance = idCardInstance;
            object.address = address;
            object.inventoryType = 'item';
            object.idItem = result[i].idItemReq;
            object.resourceType = null;
            object.requiredQuantity = result[i].requiredItemQuantity;
            object.quantityBefore = result[i].itemBefore;

            if (result[i].idItemInstance == null || result[i].idItemInstance == undefined) continue

            let quantityToSub = result[i].requiredItemQuantity
            // if (lessUpgradeCost) {
            //     quantityToSub -= Math.floor((quantityToSub * boost) / 100)
            // }

            if (reqBool) {
                try {
                    await ItemQueries.subItemByIdItemInstance(result[i].idItemInstance, quantityToSub)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
            }

            if (!reqBool && result[i].isConsumable) {

                try {
                    await ItemQueries.subItemByIdItemInstance(result[i].idItemInstance, result[i].requiredItemQuantity)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }

            }

            let remainQuantity
            try {
                remainQuantity = await ItemQueries.getQuantityByIdItemInstance(result[i].idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }

            object.quantityAfter = remainQuantity[0].quantity;
            upgradeObjects.push(object);

            if (remainQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(result[i].idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                removeElements.push({
                    id: result[i].idItemInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: result[i].idItemInstance,
                    type: 'item',
                    quantity: remainQuantity[0].quantity
                })
            }
        }

        if (upgradeBool) {
            response.done = true
            response.message = 'Upgraded successfully.'
            response.level = checkPro[0].nextLevel

            try {
                await CardQueries.upgradeCardByIdCardInstance(idCardInstance, upgradeCardLevel[0].idCardLevel)
            } catch (error) {
                logger.error(`Error in CardQueries.upgradeCardByIdCardInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
        } else {
            response.done = false
            if (downgradeAllowed) {
                response.message = 'Upgrade failed. The tool has downgraded.'
                checkPro[0].prevLevel = checkPro[0].prevLevel < 0 ? 0 : checkPro[0].prevLevel
                response.level = checkPro[0].prevLevel

                let downgradeCardLevel
                try {
                    downgradeCardLevel = await CardQueries.getCardLevelByIdCardAndLevel(checkPro[0].idCard, checkPro[0].prevLevel)
                } catch (error) {
                    logger.error(`Error in CardQueries.getCardLevelByIdCardAndLevel: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                if (downgradeCardLevel.length != 0) {
                    try {
                        await CardQueries.downgradeCardByIdCardInstance(idCardInstance, downgradeCardLevel[0].idCardLevel)
                    } catch (error) {
                        logger.error(`Error in CardQueries.downgradeCardByIdCardInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                }
            } else {
                response.message = 'Upgrade failed. But the card hasn\'t been downgraded.'
                response.level = checkPro[0].level
            }
        }
        response.inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]


        let storage = {}
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        storage.pvpPoints = resources.pvpPoints
        response.storage = storage

        //pushing the resource objects in the upgradeObjects array
        if (result[0].requiredPoints != null && result[0].requiredPoints != 0) {
            objectPoints.quantityAfter = resources.pvpPoints;
            upgradeObjects.push(objectPoints);
        }

        let objectResult = {};
        let startLevel, endLevel;

        if (response.done == true) {
            objectResult.resultUpgrade = 'upgraded';
            startLevel = currentLevel;
            endLevel = successLevel;
        } else if (!downgradeAllowed && response.done == false) {
            objectResult.resultUpgrade = 'NOT upgraded';
            startLevel = currentLevel;
            endLevel = currentLevel;
        } else if (response.done == false) {
            objectResult.resultUpgrade = 'downgraded';
            startLevel = currentLevel;
            endLevel = failLevel;
        }
        objectResult.idCardInstance = idCardInstance;
        objectResult.address = address;
        objectResult.inventoryType = null;
        objectResult.idItem = null;
        objectResult.resourceType = null;
        objectResult.requiredQuantity = null;
        objectResult.quantityBefore = null;
        objectResult.quantityAfter = null;
        objectResult.startLevel = startLevel;
        objectResult.endLevel = endLevel;
        upgradeObjects.push(objectResult);

        logger.debug(`upgradeObjects response : ${JSON.stringify(upgradeObjects)}`)

        try {
            upgradeResult = await InventoryQueries.setUpgradeToolHistory(upgradeObjects);
        } catch (error) {
            logger.error(`Error in InventoryQueries.setUpgradeToolHistory, error: ${Utils.printErrorLog(error)}`)
        }

        logger.debug(`setUpgradeToolHistory response : ${JSON.stringify(upgradeResult)}`)

        return response
    }



}

module.exports = {CardService}