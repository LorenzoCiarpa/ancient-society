const logger = require('../logging/logger');
const { FarmerQueries } = require('../queries/farmerQueries');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { Utils } = require("../utils/utils");
const random = require('random');
const { PassiveQueries } = require('../queries/passiveQueries');
const { UserQueries } = require('../queries/userQueries');

class FarmerService {
    constructor() { }

    static async verifyOwnConsumablesFarmer(address, consumableIds) {
        let checkCons;
        for (let consumable of consumableIds) {
            try {
                checkCons = await FarmerQueries.verifyOwnConsumablesFarmer(address, consumable)
            } catch (error) {
                logger.error(`FarmerQueries.verifyOwnConsumablesFarmer error : ${Utils.printErrorLog(error)}`)
                throw `FarmerQueries.verifyOwnConsumablesFarmer error : ${Utils.printErrorLog(error)}`
            }

            if (!checkCons || checkCons.length == 0 || checkCons[0].quantity == 0) {
                throw `You not own this consumable`
            }
        }

    }

    static async checkDurabilityByIdHoeInstance(hoeIdInstance) {
        let checkRes
        try {
            checkRes = await FarmerQueries.checkDurability(hoeIdInstance, 10)
            logger.debug(`FarmerQueries.checkDurability response : ${JSON.stringify(checkRes)}`)
        } catch (error) {
            logger.error(`FarmerQueries.checkDurability error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        return checkRes.length == 0 ? false : true
    }

    static async updatePassiveFarmingTable(address, idField, farmedItems, farmedRecipes, farmedFarms, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber, quantityItem, quantityRecipe, coolDown) {
        let farmedFarmsDrop = [...farmedFarms];
        console.log("FISHEDFISHESDROP ", farmedFarmsDrop)
        console.log("farmedRecipes ", farmedRecipes)
        console.log("farmedItems ", farmedItems)

        let create
        let j = 0;
        let k = 0;
        for (var i = 0; i < farmedItems.length; ++i) {
            let farmDrop = farmedFarmsDrop[i] ? farmedFarmsDrop[i].idFieldFarm : null;

            try {
                create = await FarmerQueries.createPassiveFarming(1, address, idField, farmedItems[i].idItem, farmedItems[i].quantity, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber, quantityItem[j].before, quantityItem[j].after, coolDown, farmDrop, 1)
                if (farmedFarmsDrop?.length > 0) farmedFarmsDrop.splice(0, 1)

                logger.debug(`FarmerQueries.createPassiveFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createPassiveFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            j++;
        }
        for (var i = 0; i < farmedRecipes.length; ++i) {
            let farmDrop = farmedFarmsDrop[i] ? farmedFarmsDrop[i].idFieldFarm : null;

            try {
                create = await FarmerQueries.createPassiveFarming(2, address, idField, farmedRecipes[i].idRecipe, farmedRecipes[i].quantity, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber, quantityRecipe[k].before, quantityRecipe[k].after, coolDown, farmDrop, 1)
                if (farmedFarmsDrop?.length > 0) farmedFarmsDrop.splice(0, 1)

                logger.debug(`FarmerQueries.createPassiveFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createPassiveFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            k++;
        }
        for (var i = 0; i < farmedFarmsDrop.length; ++i) {
            try {
                create = await FarmerQueries.createPassiveFarming(4, address, idField, farmedFarmsDrop[i].idFieldFarm, 1, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber, null, null, coolDown, farmedFarmsDrop[i].idFieldFarm, 1)
                logger.debug(`FarmerQueries.createPassiveFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createPassiveFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( farmedItems.length == 0 && farmedRecipes.length == 0 ) {
        //     try {
        //         create = await FarmerQueries.createPassiveFarming(3, address, idField, null, null, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber, null, null, coolDown)
        //         logger.debug(`FarmerQueries.createPassiveFarming response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`FarmerQueries.createPassiveFarming error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }

        let farmingEndingTime
        try {
            farmingEndingTime = await FarmerQueries.getFarmingEndingTime(address, idField, idFarmer, hoeIdInstance)
            logger.debug(`FarmerQueries.getFarmingEndingTime response : ${JSON.stringify(farmingEndingTime)}`)
        } catch (error) {
            logger.error(`FarmerQueries.getFarmingEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (farmingEndingTime.length == 0) {
            throw ('No draw for farming')
        }
        return farmingEndingTime[0].time
    }

    static async updateFarmingTable(address, idField, farmedItems, farmedRecipes, farmedFarms, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityFarm) {
        let farmedFarmsDrop = [...farmedFarms];
        console.log("FISHEDFISHESDROP ", farmedFarmsDrop)
        console.log("farmedRecipes ", farmedRecipes)
        console.log("farmedItems ", farmedItems)

        let create
        for (var i = 0; i < farmedItems.length; ++i) {
            let farmDrop = farmedFarmsDrop[i] ? farmedFarmsDrop[i].idFieldFarm : null;

            try {
                create = await FarmerQueries.createFarming(1, address, idField, farmedItems[i].idItem, farmedItems[i].quantity, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown, quantityItem[i].before, quantityItem[i].after, farmDrop, quantityFarm)
                if (farmedFarmsDrop?.length > 0) farmedFarmsDrop.splice(0, 1)

                logger.debug(`FarmerQueries.createFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < farmedRecipes.length; ++i) {
            let farmDrop = farmedFarmsDrop[i] ? farmedFarmsDrop[i].idFieldFarm : null;

            try {
                create = await FarmerQueries.createFarming(2, address, idField, farmedRecipes[i].idRecipe, farmedRecipes[i].quantity, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown, quantityRecipe[i].before, quantityRecipe[i].after, farmDrop, quantityFarm)
                if (farmedFarmsDrop?.length > 0) farmedFarmsDrop.splice(0, 1)

                logger.debug(`FarmerQueries.createFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < farmedFarmsDrop.length; ++i) {
            try {
                create = await FarmerQueries.createFarming(4, address, idField, farmedFarmsDrop[i].idFieldFarm, quantityFarm, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown)
                logger.debug(`FarmerQueries.createFarming response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FarmerQueries.createFarming error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( farmedItems.length == 0 && farmedRecipes.length == 0 ) {
        //     try {
        //         create = await FarmerQueries.createFarming(3, address, idField, null, null, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown)
        //         logger.debug(`FarmerQueries.createFarming response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`FarmerQueries.createFarming error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }
        let farmingEndingTime
        try {
            farmingEndingTime = await FarmerQueries.getFarmingEndingTime(address, idField, idFarmer, hoeIdInstance)
            logger.debug(`FarmerQueries.getFarmingEndingTime response : ${JSON.stringify(farmingEndingTime)}`)
        } catch (error) {
            logger.error(`FarmerQueries.getFarmingEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (farmingEndingTime.length == 0) {
            throw ('No draw for farming')
        }
        return farmingEndingTime[0].time
    }
    static async addExpToAddress(address, farmedExp) {
        let insertUserExp;
        try {
            insertUserExp = await FarmerQueries.createExpByAddress(address, farmedExp)
            logger.debug(`FarmerQueries.createExpByAddress response : ${JSON.stringify(insertUserExp)}`)
        } catch (error) {
            logger.error(`FarmerQueries.createExpByAddress error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (insertUserExp.insertId == 0) {
            let update
            try {
                update = await FarmerQueries.updateExpByAddress(address, farmedExp)
                logger.debug(`FarmerQueries.updateExpByAddress response : ${JSON.stringify(update)}`)
            } catch (error) {
                logger.error(`FarmerQueries.updateExpByAddress error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }

        return true
    }
    static async addFarmedItemsToAddress(address, farmedItems) {
        let quantityItem = [];
        for (var i = 0; i < farmedItems.length; ++i) {
            let result
            try {
                result = await FarmerQueries.checkIfUserHasItem(address, farmedItems[i].idItem)
                logger.debug(`FarmerQueries.checkIfUserHasItem response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`FarmerQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {};

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + farmedItems[i].quantity;
            quantityItem.push(quantityInstance);


            if (result.length == 0) {
                let create
                try {
                    create = await FarmerQueries.createItemInstanceByAddressIdItemQuantity(address, farmedItems[i].idItem, farmedItems[i].quantity)
                    logger.debug(`FarmerQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`FarmerQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await FarmerQueries.updateItemInstanceByIdItemInstance(result[0].idItemInstance, farmedItems[i].quantity)
                    logger.debug(`FarmerQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`FarmerQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }

        }

        return quantityItem
    }
    static async addFarmedRecipesToAddress(address, farmedRecipes) {
        let quantityRecipe = [];
        for (var i = 0; i < farmedRecipes.length; ++i) {
            let result
            try {
                result = await FarmerQueries.checkIfUserHasRecipe(address, farmedRecipes[i].idRecipe)
                logger.debug(`FarmerQueries.checkIfUserHasRecipe response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`FarmerQueries.checkIfUserHasRecipe error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {}

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + farmedRecipes[i].quantity;
            quantityRecipe.push(quantityInstance);

            if (result.length == 0) {
                let create
                try {
                    create = await FarmerQueries.createRecipeInstanceByAddressIdRecipeQuantity(address, farmedRecipes[i].idRecipe, farmedRecipes[i].quantity)
                    logger.debug(`FarmerQueries.createRecipeInstanceByAddressIdRecipeQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`FarmerQueries.createRecipeInstanceByAddressIdRecipeQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await FarmerQueries.updateRecipeInstanceByIdRecipeInstance(result[0].idRecipeInstance, farmedRecipes[i].quantity)
                    logger.debug(`FarmerQueries.updateRecipeInstanceByIdRecipeInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`FarmerQueries.updateRecipeInstanceByIdRecipeInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }
        }

        return quantityRecipe
    }
    static async farm(address, idField, consumableIds, allBonus) {
        let farmChance
        let randomNumber;
        let baseNumber;
        let percent;
        let response = { items: [], recipes: [], farms: [], experience: 0 }

        if (!(consumableIds[0] == null && consumableIds[1] == null && consumableIds[2] == null)) {
            let consumableRequirements
            try {
                consumableRequirements = await FarmerQueries.getConsumableRequirements(address, consumableIds)
                logger.debug(`FarmerQueries.getConsumableRequirements response : ${JSON.stringify(consumableRequirements)}`)
            } catch (error) {
                logger.error(`FarmerQueries.getConsumableRequirements error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (consumableRequirements.length == 0) {
                throw ('No requirement for consumables.')
            }

            let legalConsumables = {}
            let consumableAllowed = true
            for (let requirement of consumableRequirements) {
                legalConsumables[requirement.idItemConsumable] = true
                if (!requirement.isItemAllowed) {
                    consumableAllowed = false
                }
            }
            if (!consumableAllowed) {
                throw ('Not enough cost to use consumable.')
            }
            if ((consumableIds[0] != null && legalConsumables[consumableIds[0]] == undefined) || (consumableIds[1] != null && legalConsumables[consumableIds[1]] == undefined) || (consumableIds[2] != null && legalConsumables[consumableIds[2]] == undefined)) {
                throw ('User\'s forcing the API')
            }
            for (let requirement of consumableRequirements) {
                if (requirement.idItemInstance == null || requirement.idItemInstance == undefined) continue

                try {
                    await ItemQueries.subItemByIdItemInstance(requirement.idItemInstance, requirement.requiredItemQuantity)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                let remainQuantity
                try {
                    remainQuantity = await ItemQueries.getQuantityByIdItemInstance(requirement.idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                if (remainQuantity[0].quantity == 0) {
                    try {
                        await ItemQueries.removeItemInstance(requirement.idItemInstance)
                    } catch (error) {
                        logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                }
            }
        }
        // reduce special items
        let isAlwaysField
        try {
            isAlwaysField = await FarmerQueries.isAlwaysField(idField)
            logger.debug(`FarmerQueries.isAlwaysField response : ${JSON.stringify(isAlwaysField)}`)
        } catch (error) {
            logger.error(`FarmerQueries.isAlwaysField error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (!isAlwaysField) {
            let specialRequirements
            try {
                specialRequirements = await FarmerQueries.getSpecialRequirements(address, idField)
                logger.debug(`FarmerQueries.getSpecialRequirements response : ${JSON.stringify(specialRequirements)}`)
            } catch (error) {
                logger.error(`FarmerQueries.getSpecialRequirements error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            let specialRequirement = specialRequirements[0]
            if (!specialRequirement.hasInstance) {
                throw ('User is forcing API without the special requirements for the special field')
            }

            if (specialRequirement.burn) {

                let allowBurn = true;
                let noTicketSpecial = allBonus.find(x => x['bonusCode'] === 'NO_TICKET_SPECIAL');
                if (noTicketSpecial != undefined) {
                    logger.debug(`bonus found ${JSON.stringify(noTicketSpecial)}`)
                    if (random.int(0, 99) < noTicketSpecial.percentageBoost) {
                        allowBurn = false;
                    }
                }

                if (allowBurn) {
                    if (specialRequirement.type == 'item') {
                        try {
                            await ItemQueries.subItemByIdItemInstance(specialRequirement.idInventoryInstance, specialRequirement.quantity)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                        let remainQuantity
                        try {
                            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(specialRequirement.idInventoryInstance)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                        if (remainQuantity[0].quantity == 0) {
                            try {
                                await ItemQueries.removeItemInstance(specialRequirement.idInventoryInstance)
                            } catch (error) {
                                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`)
                                throw error
                            }
                        }
                    } else if (specialRequirement.type == 'tool') {
                        try {
                            await InventoryQueries.removeToolInstance(specialRequirement.idInventoryInstance)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries.removeToolInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                    }
                }
            }
        }

        try {
            farmChance = await FarmerQueries.getFarmChance(idField)
            logger.debug(`FarmerQueries.getFarmChance response : ${JSON.stringify(farmChance)}`)
        } catch (error) {
            logger.error(`FarmerQueries.getFarmChance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (farmChance.length == 0) {
            throw ('No field with the idField')
        }

        let farmedItems = [], farmableItems
        percent = random.float(0, 100);

        if (percent <= farmChance[0].chanceItem) {
            try {
                farmableItems = await FarmerQueries.farmableItems(idField)
                logger.debug(`FarmerQueries.farmableItems response : ${JSON.stringify(farmedItems)}`)
            } catch (error) {
                logger.error(`FarmerQueries.farmableItems error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let farmableItem of farmableItems) {
                baseNumber += Number(farmableItem.itemProbability);
                if (baseNumber >= randomNumber) {
                    farmedItems.push(farmableItem);
                    break;
                }
            }

            let extraLootBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_LOOT');
            if (extraLootBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraLootBonus)}`)
                if ((randomNumber = random.int(0, 99)) < extraLootBonus.percentageBoost) {
                    baseNumber = 0
                    for (let farmableItem of farmableItems) {
                        baseNumber += Number(farmableItem.itemProbability);
                        if (baseNumber >= randomNumber) {
                            farmedItems.push(farmableItem);
                            break;
                        }
                    }
                }
            }
        }



        let chancePlus = false
        if (consumableIds[0] == 75 || consumableIds[1] == 75) {
            chancePlus = true
        }

        //DONT UNCOMMENT BUG PLUS IS TOO BIG
        if (chancePlus) {
            farmChance[0].chanceRecipe += farmChance[0].chanceRecipe / 10
        }
        let farmedRecipes = [], farmableRecipes
        percent = random.float(0, 100);




        if (percent <= farmChance[0].chanceRecipe) {
            try {
                farmableRecipes = await FarmerQueries.farmableRecipes(idField)
                logger.debug(`FarmerQueries.farmableRecipes response : ${JSON.stringify(farmedRecipes)}`)
            } catch (error) {
                logger.error(`FarmerQueries.farmableRecipes error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let farmableRecipe of farmableRecipes) {
                baseNumber += Number(farmableRecipe.recipeProbability);

                if (baseNumber >= randomNumber) {
                    farmedRecipes.push(farmableRecipe);
                    break;
                }
            }

            let extraRecipeBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_RECIPE');

            if (extraRecipeBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraRecipeBonus)}`)
                if ((randomNumber = random.float(0, 99)) < extraRecipeBonus.percentageBoost) {
                    baseNumber = 0
                    for (let farmableRecipe of farmableRecipes) {
                        baseNumber += Number(farmableRecipe.recipeProbability);

                        if (baseNumber >= randomNumber) {
                            farmedRecipes.push(farmableRecipe);
                            break;
                        }
                    }
                }
            }
        }

        let noFarmDoubleLoot = false
        let noFarmDoubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_FARM');
        if (noFarmDoubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(noFarmDoubleLootBonus)}`)
            if (random.int(0, 99) < noFarmDoubleLootBonus.percentageBoost) {
                noFarmDoubleLoot = true
            }
        }

        let farmedExp = [], farmableFarms
        try {
            farmableFarms = await FarmerQueries.farmableFarms(idField)
            logger.debug(`FarmerQueries.farmExp response : ${JSON.stringify(farmableFarms)}`)
        } catch (error) {
            logger.error(`FarmerQueries.farmExp error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        randomNumber = random.float(0, 100);
        baseNumber = 0;

        for (let farmableFarm of farmableFarms) {
            baseNumber += Number(farmableFarm.probability);

            if (baseNumber >= randomNumber) {
                farmedExp.push(farmableFarm);
                break;
            }
        }

        let extraFarmBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_FARM');
        if (extraFarmBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(extraFarmBonus)}`)
            if (random.int(0, 99) < extraFarmBonus.percentageBoost) {
                baseNumber = 0;

                for (let farmableFarm of farmableFarms) {
                    baseNumber += Number(farmableFarm.probability);

                    if (baseNumber >= randomNumber) {
                        farmedExp.push(farmableFarm);
                        break;
                    }
                }
            }
        }


        let doubleDrop = false, doubleLootDur = false
        let doubleBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleBonus)}`);
            if (random.int(0, 99) < doubleBonus.percentageBoost) {
                doubleLootDur = true
            }
        }
        response.doubleLootDur = doubleLootDur;

        if (consumableIds[0] == 76 || consumableIds[1] == 76) {
            doubleDrop = true
        }

        for (var i = 0; i < farmedItems.length; ++i) {

            response.items.push(
                {
                    idItem: farmedItems[i].idItem,
                    quantity: (doubleDrop ? 2 : 1) * (doubleLootDur ? 2 : 1) * (noFarmDoubleLoot ? 2 : 1) * Math.max(Math.min(farmedItems[i].maxDrop, parseInt(this.exp_func(farmedItems[i].alpha, farmedItems[i].beta, random.int(1, 100)))), 1),
                    name: farmedItems[i].name,
                    image: farmedItems[i].image,
                    rarity: farmedItems[i].rarity
                }
            )

        }
        for (var i = 0; i < farmedRecipes.length; ++i) {

            response.recipes.push(
                {
                    idRecipe: farmedRecipes[i].idRecipe,
                    quantity: (doubleDrop ? 2 : 1) * Math.max(Math.min(farmedRecipes[i].maxDrop, parseInt(this.exp_func(farmedRecipes[i].alpha, farmedRecipes[i].beta, random.int(1, 100)))), 1),
                    name: farmedRecipes[i].name,
                    image: farmedRecipes[i].image,
                    rarity: farmedRecipes[i].rarity
                }
            )

        }

        let tripleFarm = false
        let farmForLootBonus = allBonus.find(x => x['bonusCode'] === 'FARM_FOR_LOOT');
        if (farmForLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(farmForLootBonus)}`)
            if (random.int(0, 99) < farmForLootBonus.percentageBoost) {
                tripleFarm = true
            }
        }

        for (var i = 0; i < farmedExp.length; ++i) {
            farmedExp[i].experience = (doubleDrop ? 2 : 1) * (tripleFarm ? 3 : 1) * farmedExp[i].experience
            response.farms.push(farmedExp[i])
            response.experience += farmedExp[i].experience
        }

        let upStoneBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_UP_STONE');
        if (upStoneBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(upStoneBonus)}`)
            if (random.int(0, 99) < upStoneBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Upgrade Stone") {
                        item.quantity += 1
                    }
                }
            }
        }

        let sandBonus = allBonus.find(x => x['bonusCode'] === 'BOOST_SAND');
        if (sandBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(sandBonus)}`)
            if (random.int(0, 99) < sandBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Sand") {
                        item.quantity += Math.floor((item.quantity) / 4)
                    }
                }
            }
        }

        let doubleSandBonus = allBonus.find(x => x['bonusCode'] === 'DOUBLE_SAND');
        if (doubleSandBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleSandBonus)}`)
            if (random.int(0, 99) < doubleSandBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Sand") {
                        item.quantity += item.quantity
                    }
                }
            }
        }

        let coralBonus = allBonus.find(x => x['bonusCode'] === 'BOOST_CORAL');
        if (coralBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(coralBonus)}`)
            if (random.int(0, 99) < coralBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Coral") {
                        item.quantity += Math.floor((item.quantity) / 4)
                    }
                }
            }
        }

        //DROP BONUSES WITH IDITEM
        for (let bonus of allBonus) {
            if (bonus.idItem != null) {
                logger.debug(`bonus found ${JSON.stringify(bonus)}`);
                if (random.int(0, 99) < bonus.percentageBoost) {
                    let drop;
                    try {
                        drop = await ItemQueries.getItemGivenIdItem(bonus.idItem);
                        logger.debug(`ItemQueries.getItemGivenIdItem response : ${JSON.stringify(drop)}`)
                    } catch (error) {
                        logger.error(`ItemQueries.getItemGivenIdItem error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    drop = drop[0]
                    response.items.push(
                        {
                            idItem: drop.idItem,
                            quantity: 1,
                            name: drop.name,
                            image: drop.image,
                            rarity: drop.rarity
                        }
                    )
                }
            }
        }


        let fieldChestBonus = allBonus.find(x => x['bonusCode'] === 'DROP_FIELD_CHEST');
        if (fieldChestBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(fieldChestBonus)}`)
            if (random.int(0, 99) < fieldChestBonus.percentageBoost) {
                let fieldChest
                try {
                    fieldChest = await ItemQueries.getItemGivenName("Field Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(fieldChest)}`)
                } catch (error) {
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (fieldChest.length > 0) {
                    fieldChest = fieldChest[0]
                    response.items.push(
                        {
                            idItem: fieldChest.idItem,
                            quantity: 1,
                            name: fieldChest.name,
                            image: fieldChest.image,
                            rarity: fieldChest.rarity
                        }
                    )
                }

            }
        }

        let engChestBonus = allBonus.find(x => x['bonusCode'] === 'DROP_ENGINEER_CHEST');
        if (engChestBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(engChestBonus)}`)
            if (random.int(0, 99) < engChestBonus.percentageBoost) {
                let fieldChest
                try {
                    fieldChest = await ItemQueries.getItemGivenName("Engineer's Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(fieldChest)}`)
                } catch (error) {
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (fieldChest.length > 0) {
                    fieldChest = fieldChest[0]
                    response.items.push(
                        {
                            idItem: fieldChest.idItem,
                            quantity: 1,
                            name: fieldChest.name,
                            image: fieldChest.image,
                            rarity: fieldChest.rarity
                        }
                    )
                }
            }
        }


        if (tripleFarm) {
            response.items = [];
        }
        if (noFarmDoubleLoot) {
            response.farms = []
            response.experience = 0
        }

        //logger.debug(`farmedExp:${JSON.stringify(farmedExp)}`)
        return response
    }
    static exp_func(alpha, beta, x) {
        let result = alpha * (Math.exp(beta * x))
        console.log('[INPUT] exp_func: ', alpha, beta, x)
        console.log('[OUTPUT] exp_func: ', result)
        return result
    }

    static async getFarmerBuilder(address) {
        return new Promise(async (resolve, reject) => {
            logger.debug(`getFarmerBuilder start`);
            let responseQueryTool, responseQueryFarmer, responseQuery1, responseQuery2, responseQuery3, farmingFarmer;
            let result, response, farmingHoe;
            let hoes = [], fields = [];
            let hoeEndingTime;
            let farmerEndingTime;
            let farmerIsFarming = false;

            try {
                response = await FarmerQueries.UpdateFarmingStatus();
                logger.debug(`FarmerQueries.UpdateFarmingStatus response : ${JSON.stringify(response)}`);
            } catch (error) {
                logger.error(`FarmerQueries.UpdateFarmingStatus error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQueryTool = await FarmerQueries.getTool(address);
                logger.debug(`FarmerQueries.getTool response : ${JSON.stringify(responseQueryTool)}`);
            } catch (error) {
                logger.error(`FarmerQueries.getTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQueryFarmer = await FarmerQueries.getQueryFarmer(address);
                logger.debug(`FarmerQueries.getQueryFarmer response : ${JSON.stringify(responseQueryFarmer)}`);
            } catch (error) {
                logger.error(`FarmerQueries.getQueryFarmer error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            if (responseQueryFarmer.length == 1) {
                try {
                    farmingFarmer = await FarmerQueries.getFarmingGivenIdBuilding(responseQueryFarmer[0].id);
                    logger.debug(`FarmerQueries.getFarmingGivenIdBuilding response : ${JSON.stringify(farmingFarmer)}`);
                } catch (error) {
                    logger.error(`FarmerQueries.getFarmingGivenIdBuilding error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }
            }

            try {
                responseQuery1 = await FarmerQueries.getQueryField();
                logger.debug(`FarmerQueries.getQueryField response : ${JSON.stringify(responseQuery1)}`);
            } catch (error) {
                logger.error(`FarmerQueries.getQueryField error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQuery2 = await FarmerQueries.getQueryEquippedTool(address);
                logger.debug(`FarmerQueries.getQueryEquippedTool response : ${JSON.stringify(responseQuery2)}`);
            } catch (error) {
                logger.error(`FarmerQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }



            try {
                responseQuery3 = await FarmerQueries.getQueryFieldItem();
                logger.debug(`FarmerQueries.getQueryFieldItem response : ${JSON.stringify(responseQuery3)}`);
            } catch (error) {
                logger.error(`FarmerQueries.getQueryFieldItem error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }





            for (let i = 0; i < responseQueryTool.length; i++) {
                console.log("ENTRATO 1")
                let hoeObject = {
                    id: responseQueryTool[i].idToolInstance,
                    name: responseQueryTool[i].name,
                    level: responseQueryTool[i].level,
                    rarity: responseQueryTool[i].rarity,
                    durability: responseQueryTool[i].durability,
                    image: responseQueryTool[i].image
                };

                try {
                    logger.debug(`stampa debug ${JSON.stringify(responseQueryTool[i])}`);
                    farmingHoe = await FarmerQueries.getFarmingHoeGivenidHoe(responseQueryTool[i].idToolInstance);
                    logger.debug(`FarmerQueries.getFarmingHoeGivenidHoe response : ${JSON.stringify(farmingHoe)}`);
                } catch (error) {
                    logger.error(`FarmerQueries.getFarmingHoeGivenidHoe error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }

                if (farmingHoe.length != 0) {
                    hoeObject.isFarming = true;
                    // hoeObject.farmingEndingTime = farmingHoe[0].farmingEndingTime;

                    if (responseQueryTool[i].equipped) {
                        hoeEndingTime = farmingHoe[0].farmingEndingTime;
                    }

                } else {
                    hoeObject.isFarming = false;
                }

                if (responseQueryTool[i].equipped) {
                    hoeObject.status = 'equipped';
                }
                else {
                    if (responseQueryTool[i].rarity == 1) {
                        hoeObject.status = 'available';
                    } else if (responseQueryTool[i].rarity == 2) {
                        hoeObject.status = responseQueryFarmer[0].level >= 4 ? 'available' : 'not-available';
                    } else if (responseQueryTool[i].rarity == 3) {
                        hoeObject.status = responseQueryFarmer[0].level >= 7 ? 'available' : 'not-available';
                    }
                }
                hoes.push(hoeObject);
            }


            for (let i = 0; i < responseQuery1.length; i++) {
                console.log("ENTRATO 2")

                let fieldObject = {
                    id: responseQuery1[i].idField,
                    title: responseQuery1[i].name,
                    description: responseQuery1[i].description,
                    rarityRequired: responseQuery1[i].rarityRequired,

                    isAllowed: (responseQuery2.length > 0 && responseQuery2[0].rarity >= responseQuery1[i].rarityRequired) ? true : false
                };

                if (!fieldObject.isAllowed) {
                    fieldObject.messageNotAllowed = responseQuery2.length == 0 ? "The farmer needs a farming hoe" : "The equipped hoe's rarity is too low";
                }
                else if (responseQueryFarmer.length != 1) {
                    fieldObject.isAllowed = false;
                    fieldObject.messageNotAllowed = "The user needs a staked farmer"
                }
                else if (responseQueryFarmer[0].upgradeStatus == 1) {
                    fieldObject.isAllowed = false;
                    fieldObject.messageNotAllowed = "The farmer must finish its upgrade"
                }
                else if (farmingFarmer.length > 0) {
                    fieldObject.isAllowed = false;
                    fieldObject.messageNotAllowed = "The farmer must finish the current farming session";
                    farmerIsFarming = true;
                    farmerEndingTime = farmingFarmer[0].farmingEndingTime;
                }


                fieldObject.drop = responseQuery3.filter(item => item.idField == responseQuery1[i].idField);
                fields.push(fieldObject);
            }
            result = {
                hoes, fields, farmerIsFarming, farmerEndingTime, hoeEndingTime
            };
            logger.debug(`getFarmerBuilder end`);
            return resolve(result);

        });
    }

    static async changeHoeBuilder(idHoeInstance, address) {
        let equippedHoe, response, farmingHoe, hoeEndingTime;

        try {
            response = await FarmerQueries.UpdateFarmingStatus();
            logger.debug(`FarmerQueries.UpdateFarmingStatus response : ${JSON.stringify(response)}`);
        } catch (error) {
            logger.error(`FarmerQueries.UpdateFarmingStatus error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }
        try {
            equippedHoe = await FarmerQueries.getQueryEquippedTool(address);
            logger.debug(`FarmerQueries.getQueryEquippedTool response : ${JSON.stringify(equippedHoe)}`);
        } catch (error) {
            logger.error(`FarmerQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        let hoeObject = {
            id: equippedHoe[0].idToolInstance,
            name: equippedHoe[0].name,
            level: equippedHoe[0].level,
            rarity: equippedHoe[0].rarity,
            durability: equippedHoe[0].durability,
            status: 'equipped',
        };

        try {
            farmingHoe = await FarmerQueries.getFarmingHoeGivenidHoe(equippedHoe[0].idToolInstance);
            logger.debug(`FarmerQueries.getFarmingHoeGivenidHoe response : ${JSON.stringify(farmingHoe)}`);
        } catch (error) {
            logger.error(`FarmerQueries.getFarmingHoeGivenidHoe error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        if (farmingHoe.length != 0) {
            hoeObject.isFarming = true;
            hoeObject.hoeEndingTime = farmingHoe[0].farmingEndingTime;

        } else {
            hoeObject.isFarming = false;
        }

        /* if (equippedHoe[0].equipped) {
            hoeObject.status = 'equipped';
        }
        else {
            if (equippedHoe[0].rarity == 1) {
                hoeObject.status = 'available';
            } else if (equippedHoe[0].rarity == 2) {
                hoeObject.status = responseQueryFarmer[0].level >= 4 ? 'available' : 'not-available';
            } else if (equippedHoe[0].rarity == 3) {
                hoeObject.status = responseQueryFarmer[0].level >= 7 ? 'available' : 'not-available';
            }
        } */

        return hoeObject;
    }

    static async checkRarityByHoeField(address, hoeIdInstance, idField) {
        let hoeRarity, fieldRarity

        try {
            hoeRarity = await FarmerQueries.getToolRarityGivenIdToolInstance(address, hoeIdInstance)
            logger.debug(`FarmerQueries.getToolRarityGivenIdToolInstance response : ${JSON.stringify(hoeRarity)}`)
        } catch (error) {
            logger.error(`FarmerQueries.getToolRarityGivenIdToolInstance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        try {
            fieldRarity = await FarmerQueries.getRarityGivenIdField(idField)
            logger.debug(`FarmerQueries.getRarityGivenIdField response : ${JSON.stringify(fieldRarity)}`)
        } catch (error) {
            logger.error(`FarmerQueries.getRarityGivenIdField error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (hoeRarity.length == 0) {
            return {
                pass: false,
                error: 'You haven\'t got that hoe'
            }
        } else if (fieldRarity.length == 0) {
            return {
                pass: false,
                error: 'There is no field with that idField'
            }
        } else if (hoeRarity[0].rarity < fieldRarity[0].rarityRequired) {
            return {
                pass: false,
                error: 'Hoe\' rarity is lower than Field\'s required rarity'
            }
        } else {
            return {
                pass: true
            }
        }
    }

    static async getFieldsWithFarmerAllowance(address) {

        try {
            await FarmerQueries.UpdateFarmingStatus()
        } catch (error) {
            logger.error(`FarmerQueries.UpdateFarmingStatus error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        let checkFarmer
        try {
            checkFarmer = await FarmerQueries.checkFarmer(address)
        } catch (error) {
            logger.error(`Error in FarmerQueries.checkFarmer: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let fieldMessageNotAllowed = ''
        if (checkFarmer.length == 0) {
            fieldMessageNotAllowed = 'The user needs a farmer to farm'
        } else if (!checkFarmer[0].stake) {
            fieldMessageNotAllowed = 'The user needs a staked farmer'
        } else if (checkFarmer[0].upgradeStatus) {
            fieldMessageNotAllowed = 'The farmer must finish its upgrade'
        } else if (!checkFarmer[0].hasToolInstance) {
            fieldMessageNotAllowed = 'Rarity required hoe hasn\'t been equipped'
        } else if (checkFarmer[0].nowFarming) {
            fieldMessageNotAllowed = 'The farmer must finish the current farming session'
        }
        if (!checkFarmer[0].hasToolInstance) {
            try {
                await FarmerQueries.removeEquippedTool(checkFarmer[0].idFarmer)
            } catch (error) {
                logger.error(`FarmerQueries.removeEquippedTool error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        let fieldAllowed = true
        if (fieldMessageNotAllowed != '') {
            fieldAllowed = false
        }

        let farmerResponse = { fields: [], checkFarmer: checkFarmer }

        let fields
        try {
            fields = await FarmerQueries.getFields()
        } catch (error) {
            logger.error(`FarmerQueries.getFields error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let specialFields
        try {
            specialFields = await FarmerQueries.getAllowedSpecialFields(address)
        } catch (error) {
            logger.error(`FarmerQueries.getAllowedSpecialFields error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        // console.log(fields, specialFields)
        let specialFieldObj = {}
        for (let specialField of specialFields) {
            specialFieldObj[specialField.id] = specialField
        }
        let idField = -1, fieldObject
        for (var i = 0; i < fields.length; ++i) {
            if (!fields[i].always && specialFieldObj[fields[i].id] == undefined) {
                continue
            }
            if (fields[i].id != idField && i != 0) {
                idField = fields[i].id
                farmerResponse.fields.push(fieldObject)
                fieldObject = {
                    id: fields[i].id,
                    always: fields[i].always,
                    specialInfo: specialFieldObj[fields[i].id],
                    title: fields[i].title,
                    description: fields[i].description,
                    rarityRequired: fields[i].rarityRequired,
                    isAllowed: checkFarmer.length > 0 && checkFarmer[0].rarity >= fields[i].rarityRequired && fieldAllowed ? true : false,
                    messageNotAllowed: fieldMessageNotAllowed,
                    drop: [{
                        name: fields[i].itemName,
                        image: fields[i].itemImage,
                        description: fields[i].itemDescription,
                        rarity: fields[i].itemRarity
                    }]
                }
            } else if (i == 0) {
                idField = fields[i].id
                fieldObject = {
                    id: fields[i].id,
                    always: fields[i].always,
                    specialInfo: specialFieldObj[fields[i].id],
                    title: fields[i].title,
                    description: fields[i].description,
                    rarityRequired: fields[i].rarityRequired,
                    isAllowed: checkFarmer.length > 0 && checkFarmer[0].rarity >= fields[i].rarityRequired && fieldAllowed ? true : false,
                    messageNotAllowed: fieldMessageNotAllowed,
                    drop: [{
                        name: fields[i].itemName,
                        image: fields[i].itemImage,
                        description: fields[i].itemDescription,
                        rarity: fields[i].itemRarity
                    }]
                }
            } else {
                fieldObject.drop.push({
                    name: fields[i].itemName,
                    image: fields[i].itemImage,
                    description: fields[i].itemDescription,
                    rarity: fields[i].itemRarity
                })
            }
        }
        if (fields.length != 0) {
            farmerResponse.fields.push(fieldObject)
        }

        return farmerResponse
    }

    static async burnPassiveSeed(address, pkBuilding, burnSeedCount) {
        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}

        // get full constant data for passiveFarming
        let idPassiveFarmingSEEDItem
        try {
            idPassiveFarmingSEEDItem = await PassiveQueries.getPassiveConstant('idPassiveFarmingSEEDItem')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let actionCountPerFarmingSEED
        try {
            actionCountPerFarmingSEED = await PassiveQueries.getPassiveConstant('actionCountPerFarmingSEED')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let ancienCostPerEachFarmingAction
        try {
            ancienCostPerEachFarmingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFarmingAction')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }

        // get seedItemInstance data
        let seedData
        try {
            seedData = await PassiveQueries.getItemInstanceData(address, idPassiveFarmingSEEDItem)
        } catch (error) {
            logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
        }
        if (seedData == undefined || seedData.quantity < burnSeedCount) {
            response.done = false
            response.message = 'You haven\'t got enough seeds.'
            return response
        }
        seedData.quantity -= burnSeedCount

        // sub passive seed item from idItemInstance
        try {
            await ItemQueries.subItemByIdItemInstance(seedData.idItemInstance, burnSeedCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        let remainQuantity
        try {
            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(seedData.idItemInstance)
        } catch (error) {
            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (remainQuantity[0].quantity == 0) {
            try {
                await ItemQueries.removeItemInstance(seedData.idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
        }

        let burntActions = Math.min(passiveData.burntActions + actionCountPerFarmingSEED * burnSeedCount, passiveData.maxStorableActions)
        // update burntActions
        try {
            await PassiveQueries.calculateBurntActions(passiveData.idPassive, burntActions)
        } catch (error) {
            logger.error(`PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`
        }

        // check max performable ActionCount
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
            throw error
        }
        let ancien = resources.ancien

        let hoeDurability
        try {
            hoeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
            throw error
        }
        hoeDurability = !hoeDurability ? 0 : hoeDurability

        let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFarmingAction), passiveData.storedActions, burntActions, Math.floor(hoeDurability / 10))

        response.done = true
        response.message = 'Successfully done.'
        response.passiveInfo = {
            maxPerformableActions: maxPerformableActions,
            seedData: seedData,
            burntActions: burntActions,
        }

        return response
    }
}

module.exports = { FarmerService }