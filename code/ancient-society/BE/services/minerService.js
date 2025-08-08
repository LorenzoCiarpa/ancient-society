const logger = require('../logging/logger');
const { MinerQueries } = require('../queries/minerQueries');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { Utils } = require("../utils/utils");
const random = require('random');
const { PassiveQueries } = require('../queries/passiveQueries');
const { UserQueries } = require('../queries/userQueries');

class MinerService {
    constructor() { }

    static async verifyOwnConsumablesMiner(address, consumableIds) {
        let checkCons;
        for (let consumable of consumableIds) {
            try {
                checkCons = await MinerQueries.verifyOwnConsumablesMiner(address, consumable)
            } catch (error) {
                logger.error(`MinerQueries.verifyOwnConsumablesMiner error : ${Utils.printErrorLog(error)}`)
                throw `MinerQueries.verifyOwnConsumablesMiner error : ${Utils.printErrorLog(error)}`
            }

            if (!checkCons || checkCons.length == 0 || checkCons[0].quantity == 0) {
                throw `You not own this consumable`
            }
        }

    }

    static async checkDurabilityByIdAxeInstance(axeIdInstance) {
        let checkRes
        try {
            checkRes = await MinerQueries.checkDurability(axeIdInstance, 10)
            logger.debug(`MinerQueries.checkDurability response : ${JSON.stringify(checkRes)}`)
        } catch (error) {
            logger.error(`MinerQueries.checkDurability error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        return checkRes.length == 0 ? false : true
    }

    static async updatePassiveMiningTable(address, idCave, minedItems, minedRecipes, minedMines, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber, quantityItem, quantityRecipe, coolDown) {
        let minedMinesDrop = [...minedMines];
        console.log("FISHEDFISHESDROP ", minedMinesDrop)
        console.log("minedRecipes ", minedRecipes)
        console.log("minedItems ", minedItems)

        let create
        let j = 0;
        let k = 0;
        for (var i = 0; i < minedItems.length; ++i) {
            let mineDrop = minedMinesDrop[i] ? minedMinesDrop[i].idCaveMine : null;

            try {
                create = await MinerQueries.createPassiveMining(1, address, idCave, minedItems[i].idItem, minedItems[i].quantity, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber, quantityItem[j].before, quantityItem[j].after, coolDown, mineDrop, 1)
                if (minedMinesDrop?.length > 0) minedMinesDrop.splice(0, 1)

                logger.debug(`MinerQueries.createPassiveMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createPassiveMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            j++;
        }
        for (var i = 0; i < minedRecipes.length; ++i) {
            let mineDrop = minedMinesDrop[i] ? minedMinesDrop[i].idCaveMine : null;

            try {
                create = await MinerQueries.createPassiveMining(2, address, idCave, minedRecipes[i].idRecipe, minedRecipes[i].quantity, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber, quantityRecipe[k].before, quantityRecipe[k].after, coolDown, mineDrop, 1)
                if (minedMinesDrop?.length > 0) minedMinesDrop.splice(0, 1)

                logger.debug(`MinerQueries.createPassiveMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createPassiveMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            k++;
        }
        for (var i = 0; i < minedMinesDrop.length; ++i) {
            try {
                create = await MinerQueries.createPassiveMining(4, address, idCave, minedMinesDrop[i].idCaveMine, 1, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber, null, null, coolDown, minedMinesDrop[i].idCaveMine, 1)
                logger.debug(`MinerQueries.createPassiveMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createPassiveMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( minedItems.length == 0 && minedRecipes.length == 0 ) {
        //     try {
        //         create = await MinerQueries.createPassiveMining(3, address, idCave, null, null, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber, null, null, coolDown)
        //         logger.debug(`MinerQueries.createPassiveMining response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`MinerQueries.createPassiveMining error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }

        let miningEndingTime
        try {
            miningEndingTime = await MinerQueries.getMiningEndingTime(address, idCave, idMiner, axeIdInstance)
            logger.debug(`MinerQueries.getMiningEndingTime response : ${JSON.stringify(miningEndingTime)}`)
        } catch (error) {
            logger.error(`MinerQueries.getMiningEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (miningEndingTime.length == 0) {
            throw ('No draw for mining')
        }
        return miningEndingTime[0].time
    }

    static async updateMiningTable(address, idCave, minedItems, minedRecipes, minedMines, idMiner, axeIdToolLevel, axeIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityMine) {
        let minedMinesDrop = [...minedMines];
        console.log("FISHEDFISHESDROP ", minedMinesDrop)
        console.log("minedRecipes ", minedRecipes)
        console.log("minedItems ", minedItems)

        let create
        for (var i = 0; i < minedItems.length; ++i) {
            let mineDrop = minedMinesDrop[i] ? minedMinesDrop[i].idCaveMine : null;

            try {
                create = await MinerQueries.createMining(1, address, idCave, minedItems[i].idItem, minedItems[i].quantity, idMiner, axeIdToolLevel, axeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown, quantityItem[i].before, quantityItem[i].after, mineDrop, quantityMine)
                if (minedMinesDrop?.length > 0) minedMinesDrop.splice(0, 1)

                logger.debug(`MinerQueries.createMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < minedRecipes.length; ++i) {
            let mineDrop = minedMinesDrop[i] ? minedMinesDrop[i].idCaveMine : null;

            try {
                create = await MinerQueries.createMining(2, address, idCave, minedRecipes[i].idRecipe, minedRecipes[i].quantity, idMiner, axeIdToolLevel, axeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown, quantityRecipe[i].before, quantityRecipe[i].after, mineDrop, quantityMine)
                if (minedMinesDrop?.length > 0) minedMinesDrop.splice(0, 1)

                logger.debug(`MinerQueries.createMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < minedMinesDrop.length; ++i) {
            try {
                create = await MinerQueries.createMining(4, address, idCave, minedMinesDrop[i].idCaveMine, quantityMine, idMiner, axeIdToolLevel, axeIdInstance, consumableIds[0], consumableIds[1], consumableIds[2], reduceCoolDown, noCoolDown)
                logger.debug(`MinerQueries.createMining response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`MinerQueries.createMining error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( minedItems.length == 0 && minedRecipes.length == 0 ) {
        //     try {
        //         create = await MinerQueries.createMining(3, address, idCave, null, null, idMiner, axeIdToolLevel, axeIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown)
        //         logger.debug(`MinerQueries.createMining response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`MinerQueries.createMining error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }
        let miningEndingTime
        try {
            miningEndingTime = await MinerQueries.getMiningEndingTime(address, idCave, idMiner, axeIdInstance)
            logger.debug(`MinerQueries.getMiningEndingTime response : ${JSON.stringify(miningEndingTime)}`)
        } catch (error) {
            logger.error(`MinerQueries.getMiningEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (miningEndingTime.length == 0) {
            throw ('No draw for mining')
        }
        return miningEndingTime[0].time
    }
    static async addExpToAddress(address, minedExp) {
        let insertUserExp;
        try {
            insertUserExp = await MinerQueries.createExpByAddress(address, minedExp)
            logger.debug(`MinerQueries.createExpByAddress response : ${JSON.stringify(insertUserExp)}`)
        } catch (error) {
            logger.error(`MinerQueries.createExpByAddress error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (insertUserExp.insertId == 0) {
            let update
            try {
                update = await MinerQueries.updateExpByAddress(address, minedExp)
                logger.debug(`MinerQueries.updateExpByAddress response : ${JSON.stringify(update)}`)
            } catch (error) {
                logger.error(`MinerQueries.updateExpByAddress error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }

        return true
    }
    static async addMinedItemsToAddress(address, minedItems) {
        let quantityItem = [];
        for (var i = 0; i < minedItems.length; ++i) {
            let result
            try {
                result = await MinerQueries.checkIfUserHasItem(address, minedItems[i].idItem)
                logger.debug(`MinerQueries.checkIfUserHasItem response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`MinerQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {};

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + minedItems[i].quantity;
            quantityItem.push(quantityInstance);


            if (result.length == 0) {
                let create
                try {
                    create = await MinerQueries.createItemInstanceByAddressIdItemQuantity(address, minedItems[i].idItem, minedItems[i].quantity)
                    logger.debug(`MinerQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`MinerQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await MinerQueries.updateItemInstanceByIdItemInstance(result[0].idItemInstance, minedItems[i].quantity)
                    logger.debug(`MinerQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`MinerQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }

        }

        return quantityItem
    }
    static async addMinedRecipesToAddress(address, minedRecipes) {
        let quantityRecipe = [];
        for (var i = 0; i < minedRecipes.length; ++i) {
            let result
            try {
                result = await MinerQueries.checkIfUserHasRecipe(address, minedRecipes[i].idRecipe)
                logger.debug(`MinerQueries.checkIfUserHasRecipe response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`MinerQueries.checkIfUserHasRecipe error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {}

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + minedRecipes[i].quantity;
            quantityRecipe.push(quantityInstance);

            if (result.length == 0) {
                let create
                try {
                    create = await MinerQueries.createRecipeInstanceByAddressIdRecipeQuantity(address, minedRecipes[i].idRecipe, minedRecipes[i].quantity)
                    logger.debug(`MinerQueries.createRecipeInstanceByAddressIdRecipeQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`MinerQueries.createRecipeInstanceByAddressIdRecipeQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await MinerQueries.updateRecipeInstanceByIdRecipeInstance(result[0].idRecipeInstance, minedRecipes[i].quantity)
                    logger.debug(`MinerQueries.updateRecipeInstanceByIdRecipeInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`MinerQueries.updateRecipeInstanceByIdRecipeInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }
        }

        return quantityRecipe
    }
    static async mine(address, idCave, consumableIds, allBonus) {
        let mineChance
        let randomNumber;
        let baseNumber;
        let percent;
        let response = { items: [], recipes: [], mines: [], experience: 0 }

        if (!(consumableIds[0] == null && consumableIds[1] == null && consumableIds[2] == null)) {
            let consumableRequirements
            try {
                consumableRequirements = await MinerQueries.getConsumableRequirements(address, consumableIds)
                logger.debug(`MinerQueries.getConsumableRequirements response : ${JSON.stringify(consumableRequirements)}`)
            } catch (error) {
                logger.error(`MinerQueries.getConsumableRequirements error : ${Utils.printErrorLog(error)}`)
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
        let isAlwaysCave
        try {
            isAlwaysCave = await MinerQueries.isAlwaysCave(idCave)
            logger.debug(`MinerQueries.isAlwaysCave response : ${JSON.stringify(isAlwaysCave)}`)
        } catch (error) {
            logger.error(`MinerQueries.isAlwaysCave error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (!isAlwaysCave) {
            let specialRequirements
            try {
                specialRequirements = await MinerQueries.getSpecialRequirements(address, idCave)
                logger.debug(`MinerQueries.getSpecialRequirements response : ${JSON.stringify(specialRequirements)}`)
            } catch (error) {
                logger.error(`MinerQueries.getSpecialRequirements error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            let specialRequirement = specialRequirements[0]
            if (!specialRequirement.hasInstance) {
                throw ('User is forcing API without the special requirements for the special cave')
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
            mineChance = await MinerQueries.getMineChance(idCave)
            logger.debug(`MinerQueries.getMineChance response : ${JSON.stringify(mineChance)}`)
        } catch (error) {
            logger.error(`MinerQueries.getMineChance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (mineChance.length == 0) {
            throw ('No cave with the idCave')
        }

        let minedItems = [], mineableItems
        percent = random.float(0, 100);

        if (percent <= mineChance[0].chanceItem) {
            try {
                mineableItems = await MinerQueries.mineableItems(idCave)
                logger.debug(`MinerQueries.mineableItems response : ${JSON.stringify(minedItems)}`)
            } catch (error) {
                logger.error(`MinerQueries.mineableItems error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let mineableItem of mineableItems) {
                baseNumber += mineableItem.itemProbability;
                if (baseNumber >= randomNumber) {
                    minedItems.push(mineableItem);
                    break;
                }
            }

            let extraLootBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_LOOT');
            if (extraLootBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraLootBonus)}`)
                if ((randomNumber = random.int(0, 99)) < extraLootBonus.percentageBoost) {
                    baseNumber = 0
                    for (let mineableItem of mineableItems) {
                        baseNumber += mineableItem.itemProbability;
                        if (baseNumber >= randomNumber) {
                            minedItems.push(mineableItem);
                            break;
                        }
                    }
                }
            }
        }



        let chancePlus = false
        if (consumableIds[0] == 72 || consumableIds[1] == 72) {
            chancePlus = true
        }

        //DONT UNCOMMENT BUG PLUS IS TOO BIG
        if (chancePlus) {
            mineChance[0].chanceRecipe += mineChance[0].chanceRecipe / 10
        }
        let minedRecipes = [], mineableRecipes
        percent = random.float(0, 100);




        if (percent <= mineChance[0].chanceRecipe) {
            try {
                mineableRecipes = await MinerQueries.mineableRecipes(idCave)
                logger.debug(`MinerQueries.mineableRecipes response : ${JSON.stringify(minedRecipes)}`)
            } catch (error) {
                logger.error(`MinerQueries.mineableRecipes error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let mineableRecipe of mineableRecipes) {
                baseNumber += mineableRecipe.recipeProbability;

                if (baseNumber >= randomNumber) {
                    minedRecipes.push(mineableRecipe);
                    break;
                }
            }

            let extraRecipeBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_RECIPE');

            if (extraRecipeBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraRecipeBonus)}`)
                if ((randomNumber = random.float(0, 99)) < extraRecipeBonus.percentageBoost) {
                    baseNumber = 0
                    for (let mineableRecipe of mineableRecipes) {
                        baseNumber += mineableRecipe.recipeProbability;

                        if (baseNumber >= randomNumber) {
                            minedRecipes.push(mineableRecipe);
                            break;
                        }
                    }
                }
            }
        }

        let noMineDoubleLoot = false
        let noMineDoubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_MINE');
        if (noMineDoubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(noMineDoubleLootBonus)}`)
            if (random.int(0, 99) < noMineDoubleLootBonus.percentageBoost) {
                noMineDoubleLoot = true
            }
        }

        let minedExp = [], mineableMines
        try {
            mineableMines = await MinerQueries.mineableMines(idCave)
            logger.debug(`MinerQueries.mineExp response : ${JSON.stringify(mineableMines)}`)
        } catch (error) {
            logger.error(`MinerQueries.mineExp error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        randomNumber = random.float(0, 100);
        baseNumber = 0;

        for (let mineableMine of mineableMines) {
            baseNumber += mineableMine.probability;

            if (baseNumber >= randomNumber) {
                minedExp.push(mineableMine);
                break;
            }
        }

        let extraMineBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_MINE');
        if (extraMineBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(extraMineBonus)}`)
            if (random.int(0, 99) < extraMineBonus.percentageBoost) {
                baseNumber = 0;

                for (let mineableMine of mineableMines) {
                    baseNumber += mineableMine.probability;

                    if (baseNumber >= randomNumber) {
                        minedExp.push(mineableMine);
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

        if (consumableIds[0] == 73 || consumableIds[1] == 73) {
            doubleDrop = true
        }

        for (var i = 0; i < minedItems.length; ++i) {

            response.items.push(
                {
                    idItem: minedItems[i].idItem,
                    quantity: (doubleDrop ? 2 : 1) * (doubleLootDur ? 2 : 1) * (noMineDoubleLoot ? 2 : 1) * Math.max(Math.min(minedItems[i].maxDrop, parseInt(this.exp_func(minedItems[i].alpha, minedItems[i].beta, random.int(1, 100)))), 1),
                    name: minedItems[i].name,
                    image: minedItems[i].image,
                    rarity: minedItems[i].rarity
                }
            )

        }
        for (var i = 0; i < minedRecipes.length; ++i) {

            response.recipes.push(
                {
                    idRecipe: minedRecipes[i].idRecipe,
                    quantity: (doubleDrop ? 2 : 1) * Math.max(Math.min(minedRecipes[i].maxDrop, parseInt(this.exp_func(minedRecipes[i].alpha, minedRecipes[i].beta, random.int(1, 100)))), 1),
                    name: minedRecipes[i].name,
                    image: minedRecipes[i].image,
                    rarity: minedRecipes[i].rarity
                }
            )

        }

        let tripleMine = false
        let mineForLootBonus = allBonus.find(x => x['bonusCode'] === 'MINE_FOR_LOOT');
        if (mineForLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(mineForLootBonus)}`)
            if (random.int(0, 99) < mineForLootBonus.percentageBoost) {
                tripleMine = true
            }
        }

        for (var i = 0; i < minedExp.length; ++i) {
            minedExp[i].experience = (doubleDrop ? 2 : 1) * (tripleMine ? 3 : 1) * minedExp[i].experience
            response.mines.push(minedExp[i])
            response.experience += minedExp[i].experience
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


        let caveChestBonus = allBonus.find(x => x['bonusCode'] === 'DROP_CAVE_CHEST');
        if (caveChestBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(caveChestBonus)}`)
            if (random.int(0, 99) < caveChestBonus.percentageBoost) {
                let caveChest
                try {
                    caveChest = await ItemQueries.getItemGivenName("Cave Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(caveChest)}`)
                } catch (error) {
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if(caveChest.length > 0){
                    caveChest = caveChest[0]
                    response.items.push(
                        {
                            idItem: caveChest.idItem,
                            quantity: 1,
                            name: caveChest.name,
                            image: caveChest.image,
                            rarity: caveChest.rarity
                        }
                    )
                }
                
            }
        }

        let engChestBonus = allBonus.find(x => x['bonusCode'] === 'DROP_ENGINEER_CHEST');
        if (engChestBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(engChestBonus)}`)
            if (random.int(0, 99) < engChestBonus.percentageBoost) {
                let caveChest
                try {
                    caveChest = await ItemQueries.getItemGivenName("Engineer's Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(caveChest)}`)
                } catch (error) {
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if(caveChest.length > 0){
                    caveChest = caveChest[0]
                    response.items.push(
                        {
                            idItem: caveChest.idItem,
                            quantity: 1,
                            name: caveChest.name,
                            image: caveChest.image,
                            rarity: caveChest.rarity
                        }
                    )
                }
            }
        }


        if (tripleMine) {
            response.items = [];
        }
        if (noMineDoubleLoot) {
            response.mines = []
            response.experience = 0
        }

        //logger.debug(`minedExp:${JSON.stringify(minedExp)}`)
        return response
    }
    static exp_func(alpha, beta, x) {
        let result = alpha * (Math.exp(beta * x))
        console.log('[INPUT] exp_func: ', alpha, beta, x)
        console.log('[OUTPUT] exp_func: ', result)
        return result
    }

    static async getMinerBuilder(address) {
        return new Promise(async (resolve, reject) => {
            logger.debug(`getMinerBuilder start`);
            let responseQueryTool, responseQueryMiner, responseQuery1, responseQuery2, responseQuery3, miningMiner;
            let result, response, miningAxe;
            let axes = [], caves = [];
            let axeEndingTime;
            let minerEndingTime;
            let minerIsMining = false;

            try {
                response = await MinerQueries.UpdateMiningStatus();
                logger.debug(`MinerQueries.UpdateMiningStatus response : ${JSON.stringify(response)}`);
            } catch (error) {
                logger.error(`MinerQueries.UpdateMiningStatus error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQueryTool = await MinerQueries.getTool(address);
                logger.debug(`MinerQueries.getTool response : ${JSON.stringify(responseQueryTool)}`);
            } catch (error) {
                logger.error(`MinerQueries.getTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQueryMiner = await MinerQueries.getQueryMiner(address);
                logger.debug(`MinerQueries.getQueryMiner response : ${JSON.stringify(responseQueryMiner)}`);
            } catch (error) {
                logger.error(`MinerQueries.getQueryMiner error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            if (responseQueryMiner.length == 1) {
                try {
                    miningMiner = await MinerQueries.getMiningGivenIdBuilding(responseQueryMiner[0].id);
                    logger.debug(`MinerQueries.getMiningGivenIdBuilding response : ${JSON.stringify(miningMiner)}`);
                } catch (error) {
                    logger.error(`MinerQueries.getMiningGivenIdBuilding error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }
            }

            try {
                responseQuery1 = await MinerQueries.getQueryCave();
                logger.debug(`MinerQueries.getQueryCave response : ${JSON.stringify(responseQuery1)}`);
            } catch (error) {
                logger.error(`MinerQueries.getQueryCave error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQuery2 = await MinerQueries.getQueryEquippedTool(address);
                logger.debug(`MinerQueries.getQueryEquippedTool response : ${JSON.stringify(responseQuery2)}`);
            } catch (error) {
                logger.error(`MinerQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }



            try {
                responseQuery3 = await MinerQueries.getQueryCaveItem();
                logger.debug(`MinerQueries.getQueryCaveItem response : ${JSON.stringify(responseQuery3)}`);
            } catch (error) {
                logger.error(`MinerQueries.getQueryCaveItem error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }





            for (let i = 0; i < responseQueryTool.length; i++) {
                console.log("ENTRATO 1")
                let axeObject = {
                    id: responseQueryTool[i].idToolInstance,
                    name: responseQueryTool[i].name,
                    level: responseQueryTool[i].level,
                    rarity: responseQueryTool[i].rarity,
                    durability: responseQueryTool[i].durability,
                    image: responseQueryTool[i].image
                };

                try {
                    logger.debug(`stampa debug ${JSON.stringify(responseQueryTool[i])}`);
                    miningAxe = await MinerQueries.getMiningAxeGivenidAxe(responseQueryTool[i].idToolInstance);
                    logger.debug(`MinerQueries.getMiningAxeGivenidAxe response : ${JSON.stringify(miningAxe)}`);
                } catch (error) {
                    logger.error(`MinerQueries.getMiningAxeGivenidAxe error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }

                if (miningAxe.length != 0) {
                    axeObject.isMining = true;
                    // axeObject.miningEndingTime = miningAxe[0].miningEndingTime;

                    if (responseQueryTool[i].equipped) {
                        axeEndingTime = miningAxe[0].miningEndingTime;
                    }

                } else {
                    axeObject.isMining = false;
                }

                if (responseQueryTool[i].equipped) {
                    axeObject.status = 'equipped';
                }
                else {
                    if (responseQueryTool[i].rarity == 1) {
                        axeObject.status = 'available';
                    } else if (responseQueryTool[i].rarity == 2) {
                        axeObject.status = responseQueryMiner[0].level >= 4 ? 'available' : 'not-available';
                    } else if (responseQueryTool[i].rarity == 3) {
                        axeObject.status = responseQueryMiner[0].level >= 7 ? 'available' : 'not-available';
                    }
                }
                axes.push(axeObject);
            }


            for (let i = 0; i < responseQuery1.length; i++) {
                console.log("ENTRATO 2")

                let caveObject = {
                    id: responseQuery1[i].idCave,
                    title: responseQuery1[i].name,
                    description: responseQuery1[i].description,
                    rarityRequired: responseQuery1[i].rarityRequired,

                    isAllowed: (responseQuery2.length > 0 && responseQuery2[0].rarity >= responseQuery1[i].rarityRequired) ? true : false
                };

                if (!caveObject.isAllowed) {
                    caveObject.messageNotAllowed = responseQuery2.length == 0 ? "The miner needs a mining axe" : "The equipped axe's rarity is too low";
                }
                else if (responseQueryMiner.length != 1) {
                    caveObject.isAllowed = false;
                    caveObject.messageNotAllowed = "The user needs a staked miner"
                }
                else if (responseQueryMiner[0].upgradeStatus == 1) {
                    caveObject.isAllowed = false;
                    caveObject.messageNotAllowed = "The miner must finish its upgrade"
                }
                else if (miningMiner.length > 0) {
                    caveObject.isAllowed = false;
                    caveObject.messageNotAllowed = "The miner must finish the current mining session";
                    minerIsMining = true;
                    minerEndingTime = miningMiner[0].miningEndingTime;
                }


                caveObject.drop = responseQuery3.filter(item => item.idCave == responseQuery1[i].idCave);
                caves.push(caveObject);
            }
            result = {
                axes, caves, minerIsMining, minerEndingTime, axeEndingTime
            };
            logger.debug(`getMinerBuilder end`);
            return resolve(result);

        });
    }

    static async changeAxeBuilder(idAxeInstance, address) {
        let equippedAxe, response, miningAxe, axeEndingTime;

        try {
            response = await MinerQueries.UpdateMiningStatus();
            logger.debug(`MinerQueries.UpdateMiningStatus response : ${JSON.stringify(response)}`);
        } catch (error) {
            logger.error(`MinerQueries.UpdateMiningStatus error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }
        try {
            equippedAxe = await MinerQueries.getQueryEquippedTool(address);
            logger.debug(`MinerQueries.getQueryEquippedTool response : ${JSON.stringify(equippedAxe)}`);
        } catch (error) {
            logger.error(`MinerQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        let axeObject = {
            id: equippedAxe[0].idToolInstance,
            name: equippedAxe[0].name,
            level: equippedAxe[0].level,
            rarity: equippedAxe[0].rarity,
            durability: equippedAxe[0].durability,
            status: 'equipped',
        };

        try {
            miningAxe = await MinerQueries.getMiningAxeGivenidAxe(equippedAxe[0].idToolInstance);
            logger.debug(`MinerQueries.getMiningAxeGivenidAxe response : ${JSON.stringify(miningAxe)}`);
        } catch (error) {
            logger.error(`MinerQueries.getMiningAxeGivenidAxe error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        if (miningAxe.length != 0) {
            axeObject.isMining = true;
            axeObject.axeEndingTime = miningAxe[0].miningEndingTime;

        } else {
            axeObject.isMining = false;
        }

        /* if (equippedAxe[0].equipped) {
            axeObject.status = 'equipped';
        }
        else {
            if (equippedAxe[0].rarity == 1) {
                axeObject.status = 'available';
            } else if (equippedAxe[0].rarity == 2) {
                axeObject.status = responseQueryMiner[0].level >= 4 ? 'available' : 'not-available';
            } else if (equippedAxe[0].rarity == 3) {
                axeObject.status = responseQueryMiner[0].level >= 7 ? 'available' : 'not-available';
            }
        } */

        return axeObject;
    }

    static async checkRarityByAxeCave(address, axeIdInstance, idCave) {
        let axeRarity, caveRarity

        try {
            axeRarity = await MinerQueries.getToolRarityGivenIdToolInstance(address, axeIdInstance)
            logger.debug(`MinerQueries.getToolRarityGivenIdToolInstance response : ${JSON.stringify(axeRarity)}`)
        } catch (error) {
            logger.error(`MinerQueries.getToolRarityGivenIdToolInstance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        try {
            caveRarity = await MinerQueries.getRarityGivenIdCave(idCave)
            logger.debug(`MinerQueries.getRarityGivenIdCave response : ${JSON.stringify(caveRarity)}`)
        } catch (error) {
            logger.error(`MinerQueries.getRarityGivenIdCave error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (axeRarity.length == 0) {
            return {
                pass: false,
                error: 'You haven\'t got that axe'
            }
        } else if (caveRarity.length == 0) {
            return {
                pass: false,
                error: 'There is no cave with that idCave'
            }
        } else if (axeRarity[0].rarity < caveRarity[0].rarityRequired) {
            return {
                pass: false,
                error: 'Axe\' rarity is lower than Cave\'s required rarity'
            }
        } else {
            return {
                pass: true
            }
        }
    }

    static async getCavesWithMinerAllowance(address) {

        try {
            await MinerQueries.UpdateMiningStatus()
        } catch (error) {
            logger.error(`MinerQueries.UpdateMiningStatus error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        let checkMiner
        try {
            checkMiner = await MinerQueries.checkMiner(address)
        } catch (error) {
            logger.error(`Error in MinerQueries.checkMiner: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let caveMessageNotAllowed = ''
        if (checkMiner.length == 0) {
            caveMessageNotAllowed = 'The user needs a miner to mine'
        } else if (!checkMiner[0].stake) {
            caveMessageNotAllowed = 'The user needs a staked miner'
        } else if (checkMiner[0].upgradeStatus) {
            caveMessageNotAllowed = 'The miner must finish its upgrade'
        } else if (!checkMiner[0].hasToolInstance) {
            caveMessageNotAllowed = 'Rarity required axe hasn\'t been equipped'
        } else if (checkMiner[0].nowMining) {
            caveMessageNotAllowed = 'The miner must finish the current mining session'
        }
        if (!checkMiner[0].hasToolInstance) {
            try {
                await MinerQueries.removeEquippedTool(checkMiner[0].idMiner)
            } catch (error) {
                logger.error(`MinerQueries.removeEquippedTool error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        let caveAllowed = true
        if (caveMessageNotAllowed != '') {
            caveAllowed = false
        }

        let minerResponse = { caves: [], checkMiner: checkMiner }

        let caves
        try {
            caves = await MinerQueries.getCaves()
        } catch (error) {
            logger.error(`MinerQueries.getCaves error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let specialCaves
        try {
            specialCaves = await MinerQueries.getAllowedSpecialCaves(address)
        } catch (error) {
            logger.error(`MinerQueries.getAllowedSpecialCaves error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        // console.log(caves, specialCaves)
        let specialCaveObj = {}
        for (let specialCave of specialCaves) {
            specialCaveObj[specialCave.id] = specialCave
        }
        let idCave = -1, caveObject
        for (var i = 0; i < caves.length; ++i) {
            if (!caves[i].always && specialCaveObj[caves[i].id] == undefined) {
                continue
            }
            if (caves[i].id != idCave && i != 0) {
                idCave = caves[i].id
                minerResponse.caves.push(caveObject)
                caveObject = {
                    id: caves[i].id,
                    always: caves[i].always,
                    specialInfo: specialCaveObj[caves[i].id],
                    title: caves[i].title,
                    description: caves[i].description,
                    rarityRequired: caves[i].rarityRequired,
                    isAllowed: checkMiner.length > 0 && checkMiner[0].rarity >= caves[i].rarityRequired && caveAllowed ? true : false,
                    messageNotAllowed: caveMessageNotAllowed,
                    drop: [{
                        name: caves[i].itemName,
                        image: caves[i].itemImage,
                        description: caves[i].itemDescription,
                        rarity: caves[i].itemRarity
                    }]
                }
            } else if (i == 0) {
                idCave = caves[i].id
                caveObject = {
                    id: caves[i].id,
                    always: caves[i].always,
                    specialInfo: specialCaveObj[caves[i].id],
                    title: caves[i].title,
                    description: caves[i].description,
                    rarityRequired: caves[i].rarityRequired,
                    isAllowed: checkMiner.length > 0 && checkMiner[0].rarity >= caves[i].rarityRequired && caveAllowed ? true : false,
                    messageNotAllowed: caveMessageNotAllowed,
                    drop: [{
                        name: caves[i].itemName,
                        image: caves[i].itemImage,
                        description: caves[i].itemDescription,
                        rarity: caves[i].itemRarity
                    }]
                }
            } else {
                caveObject.drop.push({
                    name: caves[i].itemName,
                    image: caves[i].itemImage,
                    description: caves[i].itemDescription,
                    rarity: caves[i].itemRarity
                })
            }
        }
        if (caves.length != 0) {
            minerResponse.caves.push(caveObject)
        }

        return minerResponse
    }

    static async burnPassiveTNT(address, pkBuilding, burnTNTCount) {
        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}

        // get full constant data for passiveMining
        let idPassiveMiningTNTItem
        try {
            idPassiveMiningTNTItem = await PassiveQueries.getPassiveConstant('idPassiveMiningTNTItem')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let actionCountPerMiningTNT
        try {
            actionCountPerMiningTNT = await PassiveQueries.getPassiveConstant('actionCountPerMiningTNT')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let ancienCostPerEachMiningAction
        try {
            ancienCostPerEachMiningAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachMiningAction')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }

        // get tntItemInstance data
        let tntData
        try {
            tntData = await PassiveQueries.getItemInstanceData(address, idPassiveMiningTNTItem)
        } catch (error) {
            logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
        }
        if (tntData == undefined || tntData.quantity < burnTNTCount) {
            response.done = false
            response.message = 'You haven\'t got enough tnts.'
            return response
        }
        tntData.quantity -= burnTNTCount

        // sub passive tnt item from idItemInstance
        try {
            await ItemQueries.subItemByIdItemInstance(tntData.idItemInstance, burnTNTCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        let remainQuantity
        try {
            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(tntData.idItemInstance)
        } catch (error) {
            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (remainQuantity[0].quantity == 0) {
            try {
                await ItemQueries.removeItemInstance(tntData.idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
        }

        let burntActions = Math.min(passiveData.burntActions + actionCountPerMiningTNT * burnTNTCount, passiveData.maxStorableActions)
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

        let axeDurability
        try {
            axeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
            throw error
        }
        axeDurability = !axeDurability ? 0 : axeDurability

        let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachMiningAction), passiveData.storedActions, burntActions, Math.floor(axeDurability / 10))

        response.done = true
        response.message = 'Successfully done.'
        response.passiveInfo = {
            maxPerformableActions: maxPerformableActions,
            tntData: tntData,
            burntActions: burntActions,
        }

        return response
    }
}

module.exports = { MinerService }