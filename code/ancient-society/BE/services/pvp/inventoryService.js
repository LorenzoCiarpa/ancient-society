const { add, startTimer, remove } = require('winston');
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
const { GearService } = require('./gearService');
const { CardService } = require('./cardService');
const { BattleQueries } = require('../../queries/pvp/battleQueries');

class InventoryService {
    static async craftService(address, idRecipeInstance, burnCardIds, burnGearIds, consumableIds, craftCount) {

        logger.info(`${address},${idRecipeInstance}`)

        let totalAncienSpent; //Need for AncientSpentReward

        let userRecipe
        try {
            userRecipe = await InventoryQueries.getRecipeGivenIdRecipeInstance(address, idRecipeInstance)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeGivenIdRecipeInstance: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.info(`${JSON.stringify(userRecipe)}`);

        if (userRecipe.length != 1) {
            throw 'User hasn\'t got that recipe'

        } else if (userRecipe[0].quantity < craftCount) {
            throw 'Own 0 recipe - can\'t craft'

        } else if (craftCount > 100) {
            throw 'You are forcing the API'

        }

        let checkRequirements
        try {
            checkRequirements = await InventoryQueries.getRecipeRequirements(address, idRecipeInstance)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeRequirements: ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        let maxPossibleCraftCount = craftCount

        logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

        let currentResource
        try {
            currentResource = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let resourceRequirement = { pvpPoints: 0 }, itemRequirement = [], recipeRequirement = [], cardRequirement = []
        for (const requirement of checkRequirements) {
            if (requirement.idPointRequirement != null) {
                if (currentResource.pvpPoints < requirement.requiredPoints) {
                    throw 'You have not enough points requirements to craft'
                }
                if (Validator.validateInput(requirement.requiredPoints) && requirement.requiredPoints != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.pvpPoints / requirement.requiredPoints));
                    resourceRequirement.pvpPoints = requirement.requiredPoints;
                }

                logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
            } else if (requirement.idItemRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                    throw 'You have not enough item requirements to craft'
                }
                if (requirement.requiredItemBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredItemQuantity))
                    itemRequirement.push({ id: requirement.requiredIdItem, quantity: requirement.requiredItemQuantity, idInstance: check[0].idItemInstance, quantityInstance: check[0].quantity })
                    logger.debug(`item - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
                }
            } else if (requirement.idGearRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getGearQuantity(address, requirement.requiredIdGearLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getGearQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough gear requirements to craft'
                }
                if (requirement.requiredToolBurn == 1) {
                    let hasBurn = false
                    for (const burnTool of check) {
                        const idGearInstance = burnTool.idGearInstance
                        for (const burnGearId of burnGearIds) {
                            if (burnGearId == idGearInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning gears'
                    }
                    maxPossibleCraftCount = 1
                }
            } else if (requirement.idRecipeRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                    throw 'You have not enough recipe requirements to craft'
                }
                if (requirement.requiredRecipeBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                    recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
                }
            } else if (requirement.idCardRequirement != null) {
                let check
                try {
                    check = await CardQueries.getCardQuantity(address, requirement.requiredIdCardLevel)
                } catch (error) {
                    logger.error(`Error in CardQueries.getCardQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough card requirements to craft'
                }
                if (requirement.requiredCardBurn == 1) {
                    let hasBurn = false
                    for (const burnCard of check) {
                        const idCardInstance = burnCard.idCardInstance
                        for (const burnCardId of burnCardIds) {
                            if (burnCardId == idCardInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning cards'
                    }
                    maxPossibleCraftCount = 1
                }
            }
        }

        let craftResponse = {};
        let craftResult;
        let craftObjects = [];
        let addElements = [], editElements = [], removeElements = []

        // crafted recipe
        let object = {};
        object.isGem = 0;
        object.isNPC = 0;
        object.address = address;
        object.inventoryType = 'recipe';
        object.idItem = null;
        object.idCardLevel = null;
        object.idGearInstance = null;
        object.idRecipe = userRecipe[0].idRecipe;
        object.resourceType = null;
        object.requiredQuantity = maxPossibleCraftCount;
        object.quantityBefore = userRecipe[0].quantity;
        object.quantityAfter = (userRecipe[0].quantity - maxPossibleCraftCount);
        craftObjects.push(object);

        // resources
        if (resourceRequirement.pvpPoints != 0) {
            let ancienObject = {}
            ancienObject.isGem = 0;
            ancienObject.isNPC = 0;
            ancienObject.address = address;
            ancienObject.inventoryType = null;
            ancienObject.idItem = null;
            ancienObject.idGearInstance = null;
            ancienObject.idRecipe = null;
            ancienObject.idCardLevel = null;
            ancienObject.resourceType = 1;
            ancienObject.requiredQuantity = resourceRequirement.pvpPoints * maxPossibleCraftCount;
            ancienObject.quantityBefore = currentResource.pvpPoints;
            ancienObject.quantityAfter = currentResource.pvpPoints - resourceRequirement.pvpPoints * maxPossibleCraftCount;
            craftObjects.push(ancienObject);
            totalAncienSpent = ancienObject.requiredQuantity; //Need for AncienSpentReward
        }

        try {
            await UserQueries.subResources(address, resourceRequirement.pvpPoints * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let storage = {}
        storage.pvpPoints = resources.pvpPoints
        craftResponse.storage = storage

        for (const i_req of itemRequirement) {
            let itemObject = {}
            itemObject.isGem = 0;
            itemObject.isNPC = 0;
            itemObject.address = address;
            itemObject.inventoryType = 'item';
            itemObject.idItem = i_req.id;
            itemObject.idGearInstance = null;
            itemObject.idRecipe = null;
            itemObject.idCardLevel = null;
            itemObject.resourceType = null;
            itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            itemObject.quantityBefore = i_req.quantityInstance;
            itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(itemObject);

            try {
                await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (itemObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeItemInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'item',
                    quantity: itemObject.quantityAfter
                })
            }
        }

        let burnCardId = -1
        if (burnCardIds.length != 0) {
            burnCardId = burnCardIds[0];

            // log history
            let cardObject = {}
            gearObject.isGem = 0;
            gearObject.isNPC = 0;
            gearObject.address = address;
            gearObject.inventoryType = 'card';
            gearObject.idItem = null;
            gearObject.idCardInstance = burnCardId;
            gearObject.idGearInstance = null;
            gearObject.idRecipe = null;
            gearObject.resourceType = null;
            gearObject.requiredQuantity = 1;
            gearObject.quantityBefore = 1;
            gearObject.quantityAfter = 0;
            craftObjects.push(gearObject);

            // remove tool instance
            try {
                await InventoryQueries.removeCardInstance(burnCardId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeCardInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnCardId,
                type: 'card'
            })
        }

        let burnGearId = -1
        if (burnGearIds.length != 0) {
            burnGearId = burnGearIds[0];

            // log history
            let gearObject = {}
            gearObject.isGem = 0;
            gearObject.isNPC = 0;
            gearObject.address = address;
            gearObject.inventoryType = 'gear';
            gearObject.idItem = null;
            gearObject.idCard = null;
            gearObject.idGearInstance = burnGearId;
            gearObject.idRecipe = null;
            gearObject.resourceType = null;
            gearObject.requiredQuantity = 1;
            gearObject.quantityBefore = 1;
            gearObject.quantityAfter = 0;
            craftObjects.push(gearObject);

            // remove tool instance
            try {
                await InventoryQueries.removeGearInstance(burnGearId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeGearInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnGearId,
                type: 'gear'
            })
        }

        for (const i_req of recipeRequirement) {
            let recipeObject = {}
            recipeObject.isGem = 0;
            recipeObject.isNPC = 0;
            recipeObject.address = address;
            recipeObject.inventoryType = 'recipe';
            recipeObject.idItem = null;
            recipeObject.idCard = null;
            recipeObject.idToolInstance = null;
            recipeObject.idRecipe = i_req.id;
            recipeObject.resourceType = null;
            recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            recipeObject.quantityBefore = i_req.quantityInstance;
            recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(recipeObject);

            try {
                await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (recipeObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeRecipeInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'recipe'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'recipe',
                    quantity: recipeObject.quantityAfter
                })
            }
        }
        craftResponse.inventory = [
            {
                action: 'add',
                elements: addElements
            },
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        let recipeIndex = 0, failedRecipeCount = 0
        let craftType
        if (checkRequirements[0].idGear != null) craftType = "gear"
        else if (checkRequirements[0].idCard != null) craftType = "card"
        else if (checkRequirements[0].idItem != null) craftType = "item"
        while (recipeIndex < maxPossibleCraftCount) {
            ++recipeIndex
            let probability = random.int(0, 99)
            if (probability < checkRequirements[0].chanceCraft) {
                let idRecipe = userRecipe[0].idRecipe
                if (craftType == 'gear') {
                    let craftedGear
                    try {
                        craftedGear = await InventoryQueries.addCraftedGear(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idGearLevel
                    try {
                        idGearLevel = await InventoryQueries.getIdGearLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idGearInstance
                    try {
                        idGearInstance = await InventoryQueries.getIdGearInstanceByAddressIdGearLevel(address, idGearLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    // move original bonus info to the crafted tool instance
                    // if (burnToolId != -1) {
                    //     try {
                    //         await InventoryQueries.moveBonusInstance(burnToolId, idToolInstance)
                    //     } catch (error) {
                    //         logger.error(`Error in InventoryQueries.moveBonusInstance: ${Utils.printErrorLog(error)}`);
                    //         return res
                    //             .status(401)
                    //             .json({
                    //                 success: false,
                    //                 error: {
                    //                     errorMessage: error
                    //                 }
                    //             })
                    //     }
                    // }

                    let gearData
                    try {
                        gearData = await InventoryQueries.getGearInstanceData(idGearInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    // get the bonus info of the tool
                    // let bonusInfo

                    // let toolIds = [idToolInstance]
                    // toolIds = toolIds.join(', ')
                    // let toolBonuses
                    // try {
                    //     toolBonuses = await ToolService.getToolBonuses(toolIds)
                    // } catch (error) {
                    //     logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                    //     return res
                    //         .status(401)
                    //         .json({
                    //             success: false,
                    //             error: {
                    //                 errorMessage: error
                    //             }
                    //         })
                    // }
                    // logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)
                    // bonusInfo = toolBonuses[idToolInstance] ? toolBonuses[idToolInstance].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']

                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idGearInstance,
                            type: 'gear',
                            quantity: 1,
                            level: gearData[0].level,
                            name: gearData[0].name,
                            image: gearData[0].image,
                            menu: {
                                craft: gearData[0].craft,
                                view: gearData[0].view,
                                send: gearData[0].send,
                                sell: gearData[0].sell
                            }
                        }]
                    })
                } else if (craftType == "item") {
                    let userItemData
                    try {
                        userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    let idItemInstance, newItemInstance
                    if (userItemData.length == 0) {
                        let createItemInstance
                        try {
                            createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'add',
                            elements: [newItemInstance]
                        })
                    } else {
                        idItemInstance = userItemData[0].idItemInstance
                        let updateItemInstance
                        try {
                            updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'edit',
                            elements: [{
                                id: idItemInstance,
                                type: 'item',
                                quantity: userItemData[0].expectedQuantity
                            }]
                        })
                    }
                } else if (craftType == "card") {
                    let craftedCard
                    try {
                        craftedCard = await InventoryQueries.addCraftedCard(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedCard: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idCardLevel
                    try {
                        idCardLevel = await InventoryQueries.getIdCardLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idCardInstance
                    try {
                        idCardInstance = await InventoryQueries.getIdCardInstanceByAddressIdCardLevel(address, idCardLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    let cardData
                    try {
                        cardData = await InventoryQueries.getCardInstanceData(idCardInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }


                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idCardInstance,
                            type: 'card',
                            quantity: 1,
                            level: cardData[0].level,
                            name: cardData[0].name,
                            image: cardData[0].image,
                            menu: {
                                craft: cardData[0].craft,
                                view: cardData[0].view,
                                send: cardData[0].send,
                                sell: cardData[0].sell
                            }
                        }]
                    })
                }
            } else {
                logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
                ++failedRecipeCount
            }
        }

        if (failedRecipeCount == maxPossibleCraftCount) {
            craftResponse.done = false
            craftResponse.message = 'All recipes craft has failed'
        } else {
            craftResponse.done = true
            craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
        }

        logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

        try {
            craftResult = await InventoryQueries.setCraftHistory(craftObjects);
        } catch (error) {
            logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
        }

        logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);

        try {
            await InventoryQueries.subRecipe(address, idRecipeInstance, maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries subRecipe: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        if (userRecipe[0].quantity == maxPossibleCraftCount) {
            try {
                await ItemQueries.removeRecipeInstance(idRecipeInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            craftResponse.inventory.push({
                action: 'remove',
                elements: [{
                    id: idRecipeInstance,
                    type: 'recipe'
                }]
            })
        } else {
            let inventoryInstanceData
            try {
                inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idRecipeInstance, 'recipe')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            craftResponse.inventory.push({
                action: 'edit',
                elements: [inventoryInstanceData]
            })
        }


        logger.info(`craft END`)

        return {
            success: true,
            data: {
                ...craftResponse
            }
        }

    }

    static async craftServiceNpc(address, idRecipe, burnCardIds, burnGearIds, consumableIds, craftCount) {

        logger.info(`${address},${idRecipe}`)

        let totalAncienSpent; //Need for AncientSpentReward

        let recipesMax;
        try {
            recipesMax = await RecipeQueries.getRecipesMaxAvailable(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipesAvailableMax: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (recipesMax[0].max != null) {

            if (recipesMax[0]?.maxCraft < craftCount) {
                throw ('Quantity not allowed')
            }

            let recipesAvailable;
            try {
                recipesAvailable = await RecipeQueries.getRecipesAvailable(idRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipesAvailable: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            if (recipesAvailable[0].available == null || recipesAvailable[0].available <= 0 || craftCount > recipesAvailable[0].available) {
                throw ('The supply is over!')
            }
        }



        if (craftCount > 100) {
            throw 'You are forcing the API'
        }

        let checkRequirements
        try {
            checkRequirements = await InventoryQueries.getNPCRecipeRequirements(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeRequirements: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`CheckRequirements : ${JSON.stringify(checkRequirements)}`)

        let maxPossibleCraftCount = craftCount

        logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

        let currentResource
        try {
            currentResource = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let resourceRequirement = { pvpPoints: 0 }, itemRequirement = [], recipeRequirement = [], cardRequirement = []
        for (const requirement of checkRequirements) {
            if (requirement.idPointRequirement != null) {
                if (currentResource.pvpPoints < requirement.requiredPoints) {
                    throw 'You have not enough points requirements to craft'
                }
                if (Validator.validateInput(requirement.requiredPoints) && requirement.requiredPoints != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.pvpPoints / requirement.requiredPoints));
                    resourceRequirement.pvpPoints = requirement.requiredPoints;
                }

                logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
            } else if (requirement.idItemRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                    throw 'You have not enough item requirements to craft'
                }
                if (requirement.requiredItemBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredItemQuantity))
                    itemRequirement.push({ id: requirement.requiredIdItem, quantity: requirement.requiredItemQuantity, idInstance: check[0].idItemInstance, quantityInstance: check[0].quantity })
                    logger.debug(`item - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
                }
            } else if (requirement.idGearRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getGearQuantity(address, requirement.requiredIdGearLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getGearQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough gear requirements to craft'
                }
                if (requirement.requiredToolBurn == 1) {
                    let hasBurn = false
                    for (const burnTool of check) {
                        const idGearInstance = burnTool.idGearInstance
                        for (const burnGearId of burnGearIds) {
                            if (burnGearId == idGearInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning gears'
                    }
                    maxPossibleCraftCount = 1
                }
            } else if (requirement.idRecipeRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                    throw 'You have not enough recipe requirements to craft'
                }
                if (requirement.requiredRecipeBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                    recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
                }
            } else if (requirement.idCardRequirement != null) {
                let check
                try {
                    check = await CardQueries.getCardQuantity(address, requirement.requiredIdCardLevel)
                } catch (error) {
                    logger.error(`Error in CardQueries.getCardQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough card requirements to craft'
                }
                if (requirement.requiredCardBurn == 1) {
                    let hasBurn = false
                    for (const burnCard of check) {
                        const idCardInstance = burnCard.idCardInstance
                        for (const burnCardId of burnCardIds) {
                            if (burnCardId == idCardInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning cards'
                    }
                    maxPossibleCraftCount = 1
                }
            }
        }

        let craftResponse = {};
        let craftResult;
        let craftObjects = [];
        let addElements = [], editElements = [], removeElements = []

        // crafted recipe
        let object = {};
        object.isGem = 0;
        object.isNPC = 1;
        object.address = address;
        object.inventoryType = 'recipe';
        object.idItem = null;
        object.idCardLevel = null;
        object.idGearInstance = null;
        object.idRecipe = idRecipe;
        object.resourceType = null;
        object.requiredQuantity = maxPossibleCraftCount;
        object.quantityBefore = null;
        object.quantityAfter = null;
        craftObjects.push(object);

        // resources
        if (resourceRequirement.pvpPoints != 0) {
            let ancienObject = {}
            ancienObject.isGem = 0;
            ancienObject.isNPC = 0;
            ancienObject.address = address;
            ancienObject.inventoryType = null;
            ancienObject.idItem = null;
            ancienObject.idGearInstance = null;
            ancienObject.idRecipe = null;
            ancienObject.idCardLevel = null;
            ancienObject.resourceType = 1;
            ancienObject.requiredQuantity = resourceRequirement.pvpPoints * maxPossibleCraftCount;
            ancienObject.quantityBefore = currentResource.pvpPoints;
            ancienObject.quantityAfter = currentResource.pvpPoints - resourceRequirement.pvpPoints * maxPossibleCraftCount;
            craftObjects.push(ancienObject);
            totalAncienSpent = ancienObject.requiredQuantity; //Need for AncienSpentReward
        }

        try {
            await UserQueries.subResources(address, resourceRequirement.pvpPoints * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let storage = {}
        storage.pvpPoints = resources.pvpPoints
        craftResponse.storage = storage

        for (const i_req of itemRequirement) {
            let itemObject = {}
            itemObject.isGem = 0;
            itemObject.isNPC = 0;
            itemObject.address = address;
            itemObject.inventoryType = 'item';
            itemObject.idItem = i_req.id;
            itemObject.idGearInstance = null;
            itemObject.idRecipe = null;
            itemObject.idCardLevel = null;
            itemObject.resourceType = null;
            itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            itemObject.quantityBefore = i_req.quantityInstance;
            itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(itemObject);

            try {
                await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (itemObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeItemInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'item',
                    quantity: itemObject.quantityAfter
                })
            }
        }

        let burnCardId = -1
        if (burnCardIds.length != 0) {
            burnCardId = burnCardIds[0];

            // log history
            let cardObject = {}
            gearObject.isGem = 0;
            gearObject.isNPC = 0;
            gearObject.address = address;
            gearObject.inventoryType = 'card';
            gearObject.idItem = null;
            gearObject.idCardInstance = burnCardId;
            gearObject.idGearInstance = null;
            gearObject.idRecipe = null;
            gearObject.resourceType = null;
            gearObject.requiredQuantity = 1;
            gearObject.quantityBefore = 1;
            gearObject.quantityAfter = 0;
            craftObjects.push(gearObject);

            // remove tool instance
            try {
                await InventoryQueries.removeCardInstance(burnCardId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeCardInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnCardId,
                type: 'card'
            })
        }

        let burnGearId = -1
        if (burnGearIds.length != 0) {
            burnGearId = burnGearIds[0];

            // log history
            let gearObject = {}
            gearObject.isGem = 0;
            gearObject.isNPC = 0;
            gearObject.address = address;
            gearObject.inventoryType = 'gear';
            gearObject.idItem = null;
            gearObject.idCard = null;
            gearObject.idGearInstance = burnGearId;
            gearObject.idRecipe = null;
            gearObject.resourceType = null;
            gearObject.requiredQuantity = 1;
            gearObject.quantityBefore = 1;
            gearObject.quantityAfter = 0;
            craftObjects.push(gearObject);

            // remove tool instance
            try {
                await InventoryQueries.removeGearInstance(burnGearId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeGearInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnGearId,
                type: 'gear'
            })
        }

        for (const i_req of recipeRequirement) {
            let recipeObject = {}
            recipeObject.isGem = 0;
            recipeObject.isNPC = 0;
            recipeObject.address = address;
            recipeObject.inventoryType = 'recipe';
            recipeObject.idItem = null;
            recipeObject.idCard = null;
            recipeObject.idToolInstance = null;
            recipeObject.idRecipe = i_req.id;
            recipeObject.resourceType = null;
            recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            recipeObject.quantityBefore = i_req.quantityInstance;
            recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(recipeObject);

            try {
                await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (recipeObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeRecipeInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'recipe'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'recipe',
                    quantity: recipeObject.quantityAfter
                })
            }
        }
        craftResponse.inventory = [
            {
                action: 'add',
                elements: addElements
            },
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        let recipeIndex = 0, failedRecipeCount = 0
        let craftType
        if (checkRequirements[0].idGear != null) craftType = "gear"
        else if (checkRequirements[0].idCard != null) craftType = "card"
        else if (checkRequirements[0].idItem != null) craftType = "item"
        while (recipeIndex < maxPossibleCraftCount) {
            ++recipeIndex
            let probability = random.int(0, 99)
            if (probability < checkRequirements[0].chanceCraft) {
                if (craftType == 'gear') {
                    let craftedGear
                    try {
                        craftedGear = await InventoryQueries.addCraftedGear(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idGearLevel
                    try {
                        idGearLevel = await InventoryQueries.getIdGearLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idGearInstance
                    try {
                        idGearInstance = await InventoryQueries.getIdGearInstanceByAddressIdGearLevel(address, idGearLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    // move original bonus info to the crafted tool instance
                    // if (burnToolId != -1) {
                    //     try {
                    //         await InventoryQueries.moveBonusInstance(burnToolId, idToolInstance)
                    //     } catch (error) {
                    //         logger.error(`Error in InventoryQueries.moveBonusInstance: ${Utils.printErrorLog(error)}`);
                    //         return res
                    //             .status(401)
                    //             .json({
                    //                 success: false,
                    //                 error: {
                    //                     errorMessage: error
                    //                 }
                    //             })
                    //     }
                    // }

                    let gearData
                    try {
                        gearData = await InventoryQueries.getGearInstanceData(idGearInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    // get the bonus info of the tool
                    // let bonusInfo

                    // let toolIds = [idToolInstance]
                    // toolIds = toolIds.join(', ')
                    // let toolBonuses
                    // try {
                    //     toolBonuses = await ToolService.getToolBonuses(toolIds)
                    // } catch (error) {
                    //     logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                    //     return res
                    //         .status(401)
                    //         .json({
                    //             success: false,
                    //             error: {
                    //                 errorMessage: error
                    //             }
                    //         })
                    // }
                    // logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)
                    // bonusInfo = toolBonuses[idToolInstance] ? toolBonuses[idToolInstance].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']

                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idGearInstance,
                            type: 'gear',
                            quantity: 1,
                            level: gearData[0].level,
                            name: gearData[0].name,
                            image: gearData[0].image,
                            menu: {
                                craft: gearData[0].craft,
                                view: gearData[0].view,
                                send: gearData[0].send,
                                sell: gearData[0].sell
                            }
                        }]
                    })
                } else if (craftType == "item") {
                    let userItemData
                    try {
                        userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    let idItemInstance, newItemInstance
                    if (userItemData.length == 0) {
                        let createItemInstance
                        try {
                            createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'add',
                            elements: [newItemInstance]
                        })
                    } else {
                        idItemInstance = userItemData[0].idItemInstance
                        let updateItemInstance
                        try {
                            updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'edit',
                            elements: [{
                                id: idItemInstance,
                                type: 'item',
                                quantity: userItemData[0].expectedQuantity
                            }]
                        })
                    }
                } else if (craftType == "card") {
                    let craftedCard
                    try {
                        craftedCard = await InventoryQueries.addCraftedCard(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedCard: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idCardLevel
                    try {
                        idCardLevel = await InventoryQueries.getIdCardLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idCardInstance
                    try {
                        idCardInstance = await InventoryQueries.getIdCardInstanceByAddressIdCardLevel(address, idCardLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    let cardData
                    try {
                        cardData = await InventoryQueries.getCardInstanceData(idCardInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }


                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idCardInstance,
                            type: 'card',
                            quantity: 1,
                            level: cardData[0].level,
                            name: cardData[0].name,
                            image: cardData[0].image,
                            menu: {
                                craft: cardData[0].craft,
                                view: cardData[0].view,
                                send: cardData[0].send,
                                sell: cardData[0].sell
                            }
                        }]
                    })
                }
            } else {
                logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
                ++failedRecipeCount
            }
        }

        if (failedRecipeCount == maxPossibleCraftCount) {
            craftResponse.done = false
            craftResponse.message = 'All recipes craft has failed'
        } else {
            craftResponse.done = true
            craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
        }

        logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

        // try {
        //     craftResult = await InventoryQueries.setCraftHistory(craftObjects);
        // } catch (error) {
        //     logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
        // }

        // logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);
        let recipeNPCData
        try {
            recipeNPCData = await InventoryService.getRecipeNPCInstanceData(address, idRecipe);
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        craftResponse.currentRecipeData = recipeNPCData


        logger.info(`craftNPC END`)

        return {
            success: true,
            data: {
                ...craftResponse
            }
        }

    }

    static async craftServiceGems(address, idRecipe, burnCardIds, burnGearIds, consumableIds, craftCount) {

        logger.info(`${address},${idRecipe}`)

        if (craftCount > 100) {
            throw 'You are forcing the API'
        }

        let checkRequirements
        try {
            checkRequirements = await InventoryQueries.getGemRecipeRequirements(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getGemRecipeRequirements: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`CheckRequirements : ${JSON.stringify(checkRequirements)}`)

        let maxPossibleCraftCount = craftCount

        logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

        let currentResource
        try {
            currentResource = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let resourceRequirement = { pvpPoints: 0 }, itemRequirement = [], recipeRequirement = []
        for (const requirement of checkRequirements) {
            if (requirement.idPointRequirement != null) {
                if (currentResource.pvpPoints < requirement.requiredPoints) {
                    throw 'You have not enough points requirements to craft'
                }
                if (Validator.validateInput(requirement.requiredPoints) && requirement.requiredPoints != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.pvpPoints / requirement.requiredPoints));
                    resourceRequirement.pvpPoints = requirement.requiredPoints;
                }

                logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
            } else if (requirement.idItemRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                    throw 'You have not enough item requirements to craft'
                }
                if (requirement.requiredItemBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredItemQuantity))
                    itemRequirement.push({ id: requirement.requiredIdItem, quantity: requirement.requiredItemQuantity, idInstance: check[0].idItemInstance, quantityInstance: check[0].quantity })
                    logger.debug(`item - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
                }
            } else if (requirement.idGearRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getGearQuantity(address, requirement.requiredIdGearLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getGearQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough gear requirements to craft'
                }
                if (requirement.requiredToolBurn == 1) {
                    let hasBurn = false
                    for (const burnTool of check) {
                        const idGearInstance = burnTool.idGearInstance
                        for (const burnGearId of burnGearIds) {
                            if (burnGearId == idGearInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning gears'
                    }
                    maxPossibleCraftCount = 1
                }
            } else if (requirement.idRecipeRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                    throw 'You have not enough recipe requirements to craft'
                }
                if (requirement.requiredRecipeBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                    recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
                }
            } else if (requirement.idCardRequirement != null) {
                let check
                try {
                    check = await CardQueries.getCardQuantity(address, requirement.requiredIdCardLevel)
                } catch (error) {
                    logger.error(`Error in CardQueries.getCardQuantity: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if (check.length == 0) {
                    throw 'You have not enough card requirements to craft'
                }
                if (requirement.requiredCardBurn == 1) {
                    let hasBurn = false
                    for (const burnCard of check) {
                        const idCardInstance = burnCard.idCardInstance
                        for (const burnCardId of burnCardIds) {
                            if (burnCardId == idCardInstance) {
                                hasBurn = true
                                break
                            }
                        }
                        if (hasBurn) {
                            break
                        }
                    }
                    if (!hasBurn) {
                        throw 'You are forcing the API with out burning cards'
                    }
                    maxPossibleCraftCount = 1
                }
            }
        }

        let craftResponse = {};
        let craftResult;
        let craftObjects = [];
        let addElements = [], editElements = [], removeElements = []
        let totalAncienSpent; //Need for AncientSpentReward
        // crafted recipe
        let object = {};
        object.isGem = 1;
        object.isNPC = 0;
        object.address = address;
        object.inventoryType = 'recipe';
        object.idItem = null;
        object.idCardLevel = null;
        object.idGearInstance = null;
        object.idRecipe = idRecipe;
        object.resourceType = null;
        object.requiredQuantity = maxPossibleCraftCount;
        object.quantityBefore = null;
        object.quantityAfter = null;
        craftObjects.push(object);

        // resources
        if (resourceRequirement.pvpPoints != 0) {
            let ancienObject = {}
            ancienObject.isGem = 0;
            ancienObject.isNPC = 0;
            ancienObject.address = address;
            ancienObject.inventoryType = null;
            ancienObject.idItem = null;
            ancienObject.idGearInstance = null;
            ancienObject.idRecipe = null;
            ancienObject.idCardLevel = null;
            ancienObject.resourceType = 1;
            ancienObject.requiredQuantity = resourceRequirement.pvpPoints * maxPossibleCraftCount;
            ancienObject.quantityBefore = currentResource.pvpPoints;
            ancienObject.quantityAfter = currentResource.pvpPoints - resourceRequirement.pvpPoints * maxPossibleCraftCount;
            craftObjects.push(ancienObject);
            totalAncienSpent = ancienObject.requiredQuantity; //Need for AncienSpentReward
        }

        try {
            await UserQueries.subResources(address, resourceRequirement.pvpPoints * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw (error)
        }
        let storage = {}
        storage.pvpPoints = resources.pvpPoints
        craftResponse.storage = storage

        for (const i_req of itemRequirement) {
            let itemObject = {}
            itemObject.isGem = 0;
            itemObject.isNPC = 0;
            itemObject.address = address;
            itemObject.inventoryType = 'item';
            itemObject.idItem = i_req.id;
            itemObject.idGearInstance = null;
            itemObject.idRecipe = null;
            itemObject.idCardLevel = null;
            itemObject.resourceType = null;
            itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            itemObject.quantityBefore = i_req.quantityInstance;
            itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(itemObject);

            try {
                await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (itemObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeItemInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'item',
                    quantity: itemObject.quantityAfter
                })
            }
        }

        let burnCardId = -1
        if (burnCardIds.length != 0) {
            burnCardId = burnCardIds[0];

            // log history
            let cardObject = {}
            cardObject.isGem = 0;
            cardObject.isNPC = 0;
            cardObject.address = address;
            cardObject.inventoryType = 'card';
            cardObject.idItem = null;
            cardObject.idCardInstance = burnCardId;
            cardObject.idGearInstance = null;
            cardObject.idRecipe = null;
            cardObject.resourceType = null;
            cardObject.requiredQuantity = 1;
            cardObject.quantityBefore = 1;
            cardObject.quantityAfter = 0;
            craftObjects.push(cardObject);

            // remove tool instance
            try {
                await InventoryQueries.removeCardInstance(burnCardId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeCardInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnCardId,
                type: 'card'
            })
        }

        let burnGearId = -1
        if (burnGearIds.length != 0) {
            burnGearId = burnGearIds[0];

            // log history
            let gearObject = {}
            gearObject.isGem = 0;
            gearObject.isNPC = 0;
            gearObject.address = address;
            gearObject.inventoryType = 'gear';
            gearObject.idItem = null;
            gearObject.idCard = null;
            gearObject.idGearInstance = burnGearId;
            gearObject.idRecipe = null;
            gearObject.resourceType = null;
            gearObject.requiredQuantity = 1;
            gearObject.quantityBefore = 1;
            gearObject.quantityAfter = 0;
            craftObjects.push(gearObject);

            // remove tool instance
            try {
                await InventoryQueries.removeGearInstance(burnGearId)
            } catch (error) {
                logger.error(`Error in InventoryQueries.removeGearInstance: ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            removeElements.push({
                id: burnGearId,
                type: 'gear'
            })
        }

        for (const i_req of recipeRequirement) {
            let recipeObject = {}
            recipeObject.isGem = 0;
            recipeObject.isNPC = 0;
            recipeObject.address = address;
            recipeObject.inventoryType = 'recipe';
            recipeObject.idItem = null;
            recipeObject.idCard = null;
            recipeObject.idToolInstance = null;
            recipeObject.idRecipe = i_req.id;
            recipeObject.resourceType = null;
            recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
            recipeObject.quantityBefore = i_req.quantityInstance;
            recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
            craftObjects.push(recipeObject);

            try {
                await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
            } catch (error) {
                logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (recipeObject.quantityAfter == 0) {
                try {
                    await ItemQueries.removeRecipeInstance(i_req.idInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                removeElements.push({
                    id: i_req.idInstance,
                    type: 'recipe'
                })
            } else {
                editElements.push({
                    id: i_req.idInstance,
                    type: 'recipe',
                    quantity: recipeObject.quantityAfter
                })
            }
        }
        craftResponse.inventory = [
            {
                action: 'add',
                elements: addElements
            },
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        let recipeIndex = 0, failedRecipeCount = 0
        let craftType
        if (checkRequirements[0].idGear != null) craftType = "gear"
        else if (checkRequirements[0].idCard != null) craftType = "card"
        else if (checkRequirements[0].idItem != null) craftType = "item"
        while (recipeIndex < maxPossibleCraftCount) {
            ++recipeIndex
            let probability = random.int(0, 99)
            if (probability < checkRequirements[0].chanceCraft) {
                if (craftType == 'gear') {
                    let craftedGear
                    try {
                        craftedGear = await InventoryQueries.addCraftedGear(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idGearLevel
                    try {
                        idGearLevel = await InventoryQueries.getIdGearLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idGearInstance
                    try {
                        idGearInstance = await InventoryQueries.getIdGearInstanceByAddressIdGearLevel(address, idGearLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    // move original bonus info to the crafted tool instance
                    // if (burnToolId != -1) {
                    //     try {
                    //         await InventoryQueries.moveBonusInstance(burnToolId, idToolInstance)
                    //     } catch (error) {
                    //         logger.error(`Error in InventoryQueries.moveBonusInstance: ${Utils.printErrorLog(error)}`);
                    //         return res
                    //             .status(401)
                    //             .json({
                    //                 success: false,
                    //                 error: {
                    //                     errorMessage: error
                    //                 }
                    //             })
                    //     }
                    // }

                    let gearData
                    try {
                        gearData = await InventoryQueries.getGearInstanceData(idGearInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    // get the bonus info of the tool
                    // let bonusInfo

                    // let toolIds = [idToolInstance]
                    // toolIds = toolIds.join(', ')
                    // let toolBonuses
                    // try {
                    //     toolBonuses = await ToolService.getToolBonuses(toolIds)
                    // } catch (error) {
                    //     logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                    //     return res
                    //         .status(401)
                    //         .json({
                    //             success: false,
                    //             error: {
                    //                 errorMessage: error
                    //             }
                    //         })
                    // }
                    // logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)
                    // bonusInfo = toolBonuses[idToolInstance] ? toolBonuses[idToolInstance].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']

                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idGearInstance,
                            type: 'gear',
                            quantity: 1,
                            level: gearData[0].level,
                            name: gearData[0].name,
                            image: gearData[0].image,
                            menu: {
                                craft: gearData[0].craft,
                                view: gearData[0].view,
                                send: gearData[0].send,
                                sell: gearData[0].sell
                            }
                        }]
                    })
                } else if (craftType == "item") {
                    let userItemData
                    try {
                        userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    let idItemInstance, newItemInstance
                    if (userItemData.length == 0) {
                        let createItemInstance
                        try {
                            createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                        } catch (error) {
                            logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'add',
                            elements: [newItemInstance]
                        })
                    } else {
                        idItemInstance = userItemData[0].idItemInstance
                        let updateItemInstance
                        try {
                            updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        craftResponse.inventory.push({
                            action: 'edit',
                            elements: [{
                                id: idItemInstance,
                                type: 'item',
                                quantity: userItemData[0].expectedQuantity
                            }]
                        })
                    }
                } else if (craftType == "card") {
                    let craftedCard
                    try {
                        craftedCard = await InventoryQueries.addCraftedCard(address, idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries addCraftedCard: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }

                    let idCardLevel
                    try {
                        idCardLevel = await InventoryQueries.getIdCardLevelByIdRecipe(idRecipe)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }
                    let idCardInstance
                    try {
                        idCardInstance = await InventoryQueries.getIdCardInstanceByAddressIdCardLevel(address, idCardLevel)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getIdGearInstanceByAddressIdGearLevel: ${Utils.printErrorLog(error)}`);
                        throw (error)
                    }

                    let cardData
                    try {
                        cardData = await InventoryQueries.getCardInstanceData(idCardInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }


                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [{
                            id: idCardInstance,
                            type: 'card',
                            quantity: 1,
                            level: cardData[0].level,
                            name: cardData[0].name,
                            image: cardData[0].image,
                            menu: {
                                craft: cardData[0].craft,
                                view: cardData[0].view,
                                send: cardData[0].send,
                                sell: cardData[0].sell
                            }
                        }]
                    })
                }
            } else {
                logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
                ++failedRecipeCount
            }
        }

        if (failedRecipeCount == maxPossibleCraftCount) {
            craftResponse.done = false
            craftResponse.message = 'All recipes craft has failed'
        } else {
            craftResponse.done = true
            craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
        }

        logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

        // try {
        //     craftResult = await InventoryQueries.setCraftHistory(craftObjects);
        // } catch (error) {
        //     logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
        // }

        // logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);
        let recipeGemData
        try {
            recipeGemData = await InventoryService.getRecipeGemInstanceData(idRecipe, address);
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        craftResponse.currentRecipeData = recipeGemData


        logger.info(`craftGem END`)

        return {
            success: true,
            data: {
                ...craftResponse
            }
        }

    }



    // add gear and cards
    static async openChest(address, idItemInstance, openCount) {
        let response = { done: false, message: '', openedCount: '' }

        console.log("Morto 1")
        let check
        try {
            check = await InventoryQueries.checkIfUserHasChest(address, idItemInstance, openCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries.checkIfUserHasChest: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (check.length == 0) {
            throw 'You don\'t have enough item'
        } else if (check[0].idChest == null) {
            throw 'That item is not the chest'
        }

        let idChest = check[0].idChest

        let openedCount = 0
        let editElementObj = {}, removeElementObj = {}, addElementObj = {}
        let editElements = [], removeElements = [], addElements = []

        let drops = []
        let hasDrop = {}
        // burn chest item
        let chestBurnt = false

        while (openedCount < openCount) {
            console.log("Morto 3")
            let result
            try {
                result = await InventoryQueries.checkRequirementsToOpenChest(address, idChest)
            } catch (error) {
                logger.error(`Error in InventoryQueries.checkRequirementsToOpenChest: ${Utils.printErrorLog(error)}`)
                throw error
            }

            console.log("Morto 4")
            let chestAllowed = result[0].isPointsAllowed && result[0].isItemAllowed
            if (!chestAllowed) {
                // stop opening chests
                break;
            }

            try {
                await UserQueries.subResources(address, result[0].requiredPoints)
            } catch (error) {
                logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                throw error
            }

            // burn requirements
            if (result[0].idItemInstance != null && result[0].idItemInstance != undefined && result[0].burn == 1) {
                try {
                    await ItemQueries.subItemByIdItemInstance(result[0].idItemInstance, result[0].requiredItemQuantity)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }

                let remainQuantity
                try {
                    remainQuantity = await ItemQueries.getQuantityByIdItemInstance(result[0].idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                if (remainQuantity[0].quantity == 0) {
                    try {
                        await ItemQueries.removeItemInstance(result[0].idItemInstance)
                    } catch (error) {
                        logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    delete addElementObj[result[0].idItemInstance];
                    delete editElementObj[result[0].idItemInstance];
                    removeElementObj[result[0].idItemInstance] = {
                        id: result[0].idItemInstance,
                        type: 'item'
                    }
                } else {
                    editElementObj[result[0].idItemInstance] = {
                        id: result[0].idItemInstance,
                        type: 'item',
                        quantity: remainQuantity[0].quantity
                    }
                }
            }

            let loots
            try {
                loots = await InventoryQueries.getChestLoots(idItemInstance)
                logger.debug(`InventoryQueries.getChestLoots response : ${JSON.stringify(loots)}`)
            } catch (error) {
                logger.error(`InventoryQueries.getChestLoots error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            try {
                await ItemQueries.subItemByIdItemInstance(idItemInstance, 1)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }

            let chestQuantity
            try {
                chestQuantity = await ItemQueries.getQuantityByIdItemInstance(idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
            if (chestQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                chestBurnt = true
                delete addElementObj[idItemInstance];
                delete editElementObj[idItemInstance];
                removeElementObj[idItemInstance] = {
                    id: idItemInstance,
                    type: 'item'
                }
            } else {
                editElementObj[idItemInstance] = {
                    id: idItemInstance,
                    type: 'item',
                    quantity: chestQuantity[0].quantity
                }
            }

            let lootDrops = Math.max(Math.min(result[0].maxDrops, parseInt(PvpHelper.exp_func(result[0].alpha, result[0].beta, random.int(1, 100)))), result[0].minDrops)
            if (loots.length == 0) {
                continue;
            }


            let randomNumber, baseNumber
            let remainQuantity
            let newRecipeInstance
            let newItemInstance
            let newCardInstance
            let newGearInstance

            while (lootDrops) {
                --lootDrops

                randomNumber = random.float(0, 100)
                baseNumber = 0

                let droppedLoot
                for (let loot of loots) {
                    baseNumber += loot.dropProbability

                    if (baseNumber >= randomNumber) {
                        droppedLoot = loot
                        break
                    }
                }

                let op, lootQuantity = Math.max(Math.min(droppedLoot.maxQuantity, parseInt(PvpHelper.exp_func(droppedLoot.alpha, droppedLoot.beta, random.int(1, 100)))), 1)
                if (hasDrop[droppedLoot.type + droppedLoot.id]) {
                    drops.map(drop => {
                        if (drop.id == droppedLoot.id && drop.type == droppedLoot.type) {
                            drop.quantity += lootQuantity
                        }
                        return drop
                    })
                } else {
                    hasDrop[droppedLoot.type + droppedLoot.id] = true
                    drops.push({ id: droppedLoot.id, type: droppedLoot.type, rarity: droppedLoot.rarity, name: droppedLoot.name, image: droppedLoot.image, quantity: lootQuantity })
                }
                logger.debug(`@@@@@@@@@@@@@@@@@droppedLoot: ${JSON.stringify(droppedLoot)}`)
                if (droppedLoot.type == 'recipe') {
                    try {
                        op = await RecipeQueries.checkIfUserHasRecipe(address, droppedLoot.id)
                        logger.debug(`RecipeQueries.checkIfUserHasRecipe response : ${JSON.stringify(op)}`)
                    } catch (error) {
                        logger.error(`RecipeQueries.checkIfUserHasRecipe error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    if (op.length == 0) {
                        let create
                        try {
                            create = await RecipeQueries.createRecipeInstanceByAddressIdRecipeQuantity(address, droppedLoot.id, lootQuantity)
                            logger.debug(`RecipeQueries.createRecipeInstanceByAddressIdRecipeQuantity response : ${JSON.stringify(create)}`)
                        } catch (error) {
                            logger.error(`RecipeQueries.createRecipeInstanceByAddressIdRecipeQuantity error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newRecipeInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'recipe')
                            logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newRecipeInstance)}`)
                        } catch (error) {
                            logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        addElementObj[newRecipeInstance.id] = {
                            id: newRecipeInstance.id,
                            type: newRecipeInstance.type,
                            isChest: newRecipeInstance.isChest,
                            quantity: newRecipeInstance.quantity,
                            name: newRecipeInstance.name,
                            image: newRecipeInstance.image,
                            level: newRecipeInstance.level,
                            rarity: newRecipeInstance.rarity,
                            menu: {
                                craft: newRecipeInstance.craft,
                                view: newRecipeInstance.view,
                                send: newRecipeInstance.send,
                                sell: newRecipeInstance.sell
                            }
                        }
                    } else {
                        let update
                        try {
                            update = await RecipeQueries.updateRecipeInstanceByIdRecipeInstance(op[0].idRecipeInstance, lootQuantity)
                            logger.debug(`RecipeQueries.updateRecipeInstanceByIdRecipeInstance response : ${JSON.stringify(update)}`)
                        } catch (error) {
                            logger.error(`RecipeQueries.updateRecipeInstanceByIdRecipeInstance error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            remainQuantity = await RecipeQueries.getQuantityByIdRecipeInstance(op[0].idRecipeInstance)
                        } catch (error) {
                            logger.error(`Error in RecipeQueries.getQuantityByIdRecipeInstance: ${Utils.printErrorLog(error)}`);
                            throw error
                        }
                        editElementObj[op[0].idRecipeInstance] = {
                            id: op[0].idRecipeInstance,
                            type: 'recipe',
                            quantity: remainQuantity.quantity
                        }
                    }
                } else if (droppedLoot.type == 'item') {
                    try {
                        op = await ItemQueries.checkIfUserHasItem(address, droppedLoot.id)
                        logger.debug(`ItemQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`)
                    } catch (error) {
                        logger.error(`ItemQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    if (op.length == 0) {
                        let create
                        try {
                            create = await ItemQueries.createItemInstanceByAddressIdItemQuantity(address, droppedLoot.id, lootQuantity)
                            logger.debug(`ItemQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
                        } catch (error) {
                            logger.error(`ItemQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newItemInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'item')
                            logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newItemInstance)}`)
                        } catch (error) {
                            logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        addElementObj[newItemInstance.id] = {
                            id: newItemInstance.id,
                            type: newItemInstance.type,
                            isChest: newItemInstance.isChest,
                            quantity: newItemInstance.quantity,
                            name: newItemInstance.name,
                            image: newItemInstance.image,
                            level: newItemInstance.level,
                            rarity: newItemInstance.rarity,
                            menu: {
                                craft: newItemInstance.craft,
                                view: newItemInstance.view,
                                send: newItemInstance.send,
                                sell: newItemInstance.sell
                            }
                        }
                    } else {
                        let update
                        try {
                            update = await ItemQueries.updateItemInstanceByIdItemInstance(op[0].idItemInstance, lootQuantity)
                            logger.debug(`FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
                        } catch (error) {
                            logger.error(`FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(op[0].idItemInstance)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                            throw error
                        }
                        editElementObj[op[0].idItemInstance] = {
                            id: op[0].idItemInstance,
                            type: 'item',
                            quantity: remainQuantity[0].quantity
                        }
                    }
                } else if (droppedLoot.type == 'card') {
                    op = { ...[] };
                    let create
                    try {
                        create = await CardQueries.createCardInstanceByAddressIdCardQuantity(address, droppedLoot.id, lootQuantity)
                        logger.debug(`CardQueries.createCardInstanceByAddressIdCardQuantity response : ${JSON.stringify(create)}`)
                    } catch (error) {
                        logger.error(`CardQueries.createCardInstanceByAddressIdCardQuantity error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    try {
                        newCardInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'card')
                        logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newCardInstance)}`)
                    } catch (error) {
                        logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    addElementObj[newCardInstance.id] = {
                        id: newCardInstance.id,
                        type: newCardInstance.type,
                        isChest: newCardInstance.isChest,
                        quantity: newCardInstance.quantity,
                        name: newCardInstance.name,
                        image: newCardInstance.image,
                        level: newCardInstance.level,
                        rarity: newCardInstance.rarity,
                        menu: {
                            craft: newCardInstance.craft,
                            view: newCardInstance.view,
                            send: newCardInstance.send,
                            sell: newCardInstance.sell
                        }
                    }

                } else if (droppedLoot.type == 'gear') {
                    op = { ...[] };
                    let create
                    try {
                        create = await GearQueries.createGearInstanceByAddressIdGear(address, droppedLoot.id)
                        logger.debug(`GearQueries.createGearInstanceByAddressIdGear response : ${JSON.stringify(create)}`)
                    } catch (error) {
                        logger.error(`GearQueries.createGearInstanceByAddressIdGear error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    try {
                        newGearInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'gear')
                        logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newGearInstance)}`)
                    } catch (error) {
                        logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    addElementObj[newGearInstance.id] = {
                        id: newGearInstance.id,
                        type: newGearInstance.type,
                        isChest: newGearInstance.isChest,
                        quantity: newGearInstance.quantity,
                        name: newGearInstance.name,
                        image: newGearInstance.image,
                        level: newGearInstance.level,
                        rarity: newGearInstance.rarity,
                        menu: {
                            craft: newGearInstance.craft,
                            view: newGearInstance.view,
                            send: newGearInstance.send,
                            sell: newGearInstance.sell
                        }
                    }

                }

                //LOG CHEST OPENING - VARS
                let logChestOpening;
                let logChestOpeningInfo = {
                    address,
                    idChest,
                    lootNumber: lootDrops,
                    idItem: null,
                    idRecipe: null,
                    quantityBefore: 0,
                    quantity: lootQuantity,
                    quantityAfter: null,
                };
                //GET IDs
                if (droppedLoot.type == 'recipe') logChestOpeningInfo.idRecipe = droppedLoot.id
                if (droppedLoot.type == 'item') logChestOpeningInfo.idItem = droppedLoot.id
                if (droppedLoot.type == 'card') logChestOpeningInfo.idCard = droppedLoot.id
                if (droppedLoot.type == 'gear') logChestOpeningInfo.idGear = droppedLoot.id
                //GET Quantity After - New Drop
                if (op.length == 0 && droppedLoot.type == 'recipe') logChestOpeningInfo.quantityAfter = newRecipeInstance.quantity
                if (op.length == 0 && droppedLoot.type == 'item') logChestOpeningInfo.quantityAfter = newItemInstance.quantity
                //if (op.length == 0 && droppedLoot.type == 'card') logChestOpeningInfo.quantityAfter = newCardInstance.quantity
                //GET Quantity After - Already Drop
                if (!op.length == 0) logChestOpeningInfo.quantityBefore = op[0].quantity
                if ((!op.length == 0) && droppedLoot.type == 'recipe') logChestOpeningInfo.quantityAfter = remainQuantity.quantity
                if ((!op.length == 0) && droppedLoot.type == 'item') logChestOpeningInfo.quantityAfter = remainQuantity[0].quantity
                //if ((!op.length == 0) && droppedLoot.type == 'card') logChestOpeningInfo.quantityAfter = remainQuantity[0].quantity
                //QUERY
                try {
                    logChestOpening = await InventoryQueries.logChestOpening(logChestOpeningInfo)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.logChestOpening: ${Utils.printErrorLog(error)}`)
                    throw error
                }
            }

            ++openedCount;
        }

        response.done = true
        response.openedCount = openedCount
        if (openedCount == openCount) {
            response.message = `All chests are opened successfully`
        } else if (openedCount == 0) {
            response.message = `Not enough cost - No chest opened`
        } else {
            response.message = `Not enough cost to open ALL chests - ${openedCount} opened`
        }
        for (const addElement in addElementObj) {
            addElements.push(addElementObj[addElement]);
        }
        for (const editElement in editElementObj) {
            editElements.push(editElementObj[editElement]);
        }
        for (const removeElement in removeElementObj) {
            removeElements.push(removeElementObj[removeElement]);
        }
        response.inventory = [
            {
                action: 'remove',
                elements: removeElements
            },
            {
                action: 'add',
                elements: addElements
            },
            {
                action: 'edit',
                elements: editElements
            },
        ]

        response.drop = drops

        let storage = {}
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
            throw error
        }
        storage.pvpPoints = resources.pvpPoints
        response.storage = storage

        if (!chestBurnt) {
            let inventoryInstanceData
            try {
                inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idItemInstance, 'item')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                throw error
            }

            response.inventory.push({
                action: 'edit',
                elements: [inventoryInstanceData]
            })
        }

        return response
    }

    static async getInventoryInstanceData(address, idInventoryInstance, inventoryType) {
        console.log('############# getInventoryInstanceData: ', address, idInventoryInstance, inventoryType)
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType(address, idInventoryInstance, inventoryType)
            // console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw 'The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            isChest: (inventoryInstanceRawData[0].type == 'item' ? inventoryInstanceRawData[0].isChest : false),
            isWithdrawable: (inventoryInstanceRawData[0].type == 'item' ? inventoryInstanceRawData[0].isWithdrawable : false),
            percentageBuff: (inventoryInstanceRawData[0].type == 'gear' ? inventoryInstanceRawData[0].percentageBuff : false),
            flatBuff: (inventoryInstanceRawData[0].type == 'gear' ? inventoryInstanceRawData[0].flatBuff : false),
            buffAttribute: (inventoryInstanceRawData[0].type == 'gear' ? inventoryInstanceRawData[0].buffAttribute : false),
            gType: (inventoryInstanceRawData[0].type == 'gear' ? inventoryInstanceRawData[0].gType : ''),
            category:(inventoryInstanceRawData[0].type == 'recipe' ? inventoryInstanceRawData[0].category : ''),
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            rarity: inventoryInstanceRawData[0].rarity,
            quantity: inventoryInstanceRawData[0].quantity,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }

        //if(inventoryInstanceRawData[0].isWithdrawable) inventoryInstanceData.maticRatio = inventoryInstanceRawData[0].maticRatio;

        if (inventoryType == 'item' && inventoryInstanceRawData[0].isChest == 1) {
            let loots
            try {
                loots = await InventoryQueries.getChestLoots(idInventoryInstance)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getChestLoots: ${Utils.printErrorLog(error)}`)
                throw error
            }
            let chestIsAllowed = inventoryInstanceRawData[0].isPointsAllowed
            let requirementsArray = []
            if (inventoryInstanceRawData[0].requiredPoints != 0) {
                requirementsArray.push({
                    name: 'pvpPoints',
                    image: serverConfig.PVPPOINTS_IMAGE,
                    quantity: inventoryInstanceRawData[0].requiredAncien,
                    isAllowed: inventoryInstanceRawData[0].isAncienAllowed
                })
            }

            if (!inventoryInstanceRawData[0].isItemAllowed) {
                chestIsAllowed = false
            }
            if (inventoryInstanceRawData[0].requiredItemQuantity != 0) {
                requirementsArray.push({
                    name: inventoryInstanceRawData[0].requiredItemName,
                    image: inventoryInstanceRawData[0].requiredItemImage,
                    quantity: inventoryInstanceRawData[0].requiredItemQuantity,
                    isAllowed: inventoryInstanceRawData[0].isItemAllowed
                })
            }
            inventoryInstanceData.chest = {
                loots: loots.map((loot) => {
                    return { ...loot, maxQuantity: 0 }
                }),
                isAllowed: chestIsAllowed,
                minDrops: inventoryInstanceRawData[0].minDrops,
                maxDrops: inventoryInstanceRawData[0].maxDrops,
                requirements: requirementsArray
            }
        } else if (inventoryType == 'gear') {
            inventoryInstanceData.level = inventoryInstanceRawData[0].level
            inventoryInstanceData.isAvailable = {
                upgrade: inventoryInstanceRawData[0].isUpgradable
            }

            let upgradeRequirements = []
            for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
                const row = inventoryInstanceRawData[i]
                if (row.action == 'upgrade') {
                    upgradeRequirements.push(row)
                }
            }
            if (inventoryInstanceRawData[0].isUpgradable) {
                let upgradeIsAllowed = upgradeRequirements[0].isPointsAllowed
                let requirementsArray = []
                let nextLevelInfo
                try {
                    nextLevelInfo = await InventoryQueries.getNextLevelGearInfo(inventoryInstanceRawData[0].idGearLevel, inventoryInstanceRawData[0].idGear)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getNextLevelGearInfo: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                logger.debug(`NextLevelInfos are ${JSON.stringify(nextLevelInfo)} `)
                if (upgradeRequirements[0].requiredPoints != 0) {
                    requirementsArray.push({
                        name: 'pvpPoints',
                        image: serverConfig.PVPPOINTS_IMAGE,
                        quantity: upgradeRequirements[0].requiredPoints,
                        isAllowed: upgradeRequirements[0].isPointsAllowed
                    })
                }
                for (var requirement of upgradeRequirements) {
                    if (!requirement.isItemAllowed) {
                        upgradeIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                }

                upgradeIsAllowed = requirementsArray.length == 0 ? false : upgradeIsAllowed
                inventoryInstanceData.upgrade = {
                    isAllowed: upgradeIsAllowed,
                    probability: upgradeRequirements[0].chanceUpgrade,
                    requirements: requirementsArray,
                    hasConsumables: false,
                    consumables: [],
                    nextLevel: {
                        buffAttribute: nextLevelInfo[0]?.buffAttribute,
                        percentageBuff: nextLevelInfo[0]?.percentageBuff,
                        flatBuff: nextLevelInfo[0]?.flatBuff,
                    }
                }

                //     let upgradeConsumables
                //     try {
                //         upgradeConsumables = await InventoryQueries.getToolConsumables('upgrade', idInventoryInstance)
                //     } catch (error) {
                //         logger.error(`Error in InventoryQueries.getToolConsumables: ${Utils.printErrorLog(error)}`)
                //         throw error
                //     }
                //     inventoryInstanceData.upgrade.hasConsumables = upgradeConsumables.length > 0 ? true : false
                //     for (var i = 0; i < upgradeConsumables.length; ++i) {
                //         inventoryInstanceData.upgrade.consumables.push({
                //             id: upgradeConsumables[i].idItemConsumable,
                //             name: upgradeConsumables[i].name,
                //             image: upgradeConsumables[i].image,
                //             description: upgradeConsumables[i].description,
                //             quantity: upgradeConsumables[i].quantity
                //         })
                //     }
                // }
            }
            return inventoryInstanceData
        } else if (inventoryType == 'card') {
            inventoryInstanceData.level = inventoryInstanceRawData[0].level
            inventoryInstanceData.isAvailable = {
                upgrade: inventoryInstanceRawData[0].isUpgradable
            }

            let upgradeRequirements = []
            for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
                const row = inventoryInstanceRawData[i]
                if (row.action == 'upgrade') {
                    upgradeRequirements.push(row)
                }
            }
            if (inventoryInstanceRawData[0].isUpgradable) {
                let upgradeIsAllowed = upgradeRequirements[0].isPointsAllowed
                let requirementsArray = []
                if (upgradeRequirements[0].requiredPoints != 0) {
                    requirementsArray.push({
                        name: 'pvpPoints',
                        image: serverConfig.PVPPOINTS_IMAGE,
                        quantity: upgradeRequirements[0].requiredPoints,
                        isAllowed: upgradeRequirements[0].isPointsAllowed
                    })
                }
                for (var requirement of upgradeRequirements) {
                    if (!requirement.isItemAllowed) {
                        upgradeIsAllowed = false
                    } if (!requirement.isCardAllowed) {
                        upgradeIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                }
                upgradeIsAllowed = requirementsArray.length == 0 ? false : upgradeIsAllowed
                inventoryInstanceData.upgrade = {
                    isAllowed: upgradeIsAllowed,
                    probability: upgradeRequirements[0].chanceUpgrade,
                    requirements: requirementsArray,
                    hasConsumables: false,
                    consumables: []
                }

                //     let upgradeConsumables
                //     try {
                //         upgradeConsumables = await InventoryQueries.getToolConsumables('upgrade', idInventoryInstance)
                //     } catch (error) {
                //         logger.error(`Error in InventoryQueries.getToolConsumables: ${Utils.printErrorLog(error)}`)
                //         throw error
                //     }
                //     inventoryInstanceData.upgrade.hasConsumables = upgradeConsumables.length > 0 ? true : false
                //     for (var i = 0; i < upgradeConsumables.length; ++i) {
                //         inventoryInstanceData.upgrade.consumables.push({
                //             id: upgradeConsumables[i].idItemConsumable,
                //             name: upgradeConsumables[i].name,
                //             image: upgradeConsumables[i].image,
                //             description: upgradeConsumables[i].description,
                //             quantity: upgradeConsumables[i].quantity
                //         })
                //     }
                // }
            }
            return inventoryInstanceData
        } else if (inventoryType == 'recipe') {
            let craftType, craftedName, craftedImage
            //PN gear PN1 item PN2 card
            if (inventoryInstanceRawData[0].productName1 == null && inventoryInstanceRawData[0].productName2 == null) {
                craftType = 'gear'
                craftedName = inventoryInstanceRawData[0].productName
                craftedImage = inventoryInstanceRawData[0].productImage
            } if (inventoryInstanceRawData[0].productName1 == null && inventoryInstanceRawData[0].productName == null) {
                craftType = "card"
                craftedName = inventoryInstanceRawData[0].productName2
                craftedImage = inventoryInstanceRawData[0].productImage2
            } if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName2 == null) {
                craftType = "item"
                craftedName = inventoryInstanceRawData[0].productName1;
                craftedImage = inventoryInstanceRawData[0].productImage1;
            }
            inventoryInstanceData.isAvailable = {
                craft: 1
            }
            let craftRequirements = []
            for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
                const row = inventoryInstanceRawData[i]
                craftRequirements.push(row)
            }
            let craftIsAllowed = true
            let requirementsArray = []
            let idGearRequirement = {}
            let idCardRequirement = {}
            let hasGearBurn = false
            let hasCardBurn = false
            for (let requirement of craftRequirements) {
                if (requirement.idPointRequirement != null) {
                    if (!(requirement.isPointsAllowed)) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredPoints != 0) {
                        requirementsArray.push({
                            name: 'PvpPoints',
                            type: "points",
                            image: serverConfig.PVPPOINTS_IMAGE,
                            quantity: requirement.requiredPoints,
                            isAllowed: requirement.isPointsAllowed
                        })
                    }
                } else if (requirement.idItemRequirement != null) {
                    if (!requirement.isItemAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            type: "item",
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                } else if (requirement.idGearRequirement != null && idGearRequirement[requirement.idGearRequirement] == undefined) {
                    idGearRequirement[requirement.idGearRequirement] = true
                    if (!requirement.isGearAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.burn) {
                        hasGearBurn = true
                    }
                    requirementsArray.push({
                        name: requirement.requiredGearName,
                        image: requirement.requiredGearImage,
                        quantity: 1,
                        type: "gear",
                        level: requirement.requiredGearLevel,
                        burn: requirement.burn,
                        isAllowed: requirement.isGearAllowed,
                        idGearLevel: requirement.requiredIdGearLevel
                    })
                } else if (requirement.idCardRequirement != null && idCardRequirement[requirement.idCardRequirement] == undefined) {
                    idCardRequirement[requirement.idCardRequirement] = true
                    if (!requirement.isCardAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.burn) {
                        hasCardBurn = true
                    }
                    requirementsArray.push({
                        name: requirement.requiredCardName,
                        image: requirement.requiredCardImage,
                        quantity: 1,
                        type: "card",
                        level: requirement.requiredCardLevel,
                        burn: requirement.burn,
                        isAllowed: requirement.isCardAllowed,
                        idCardLevel: requirement.requiredIdCardLevel
                    })
                } else if (requirement.idRecipeRequirement != null) {
                    if (!requirement.isRecipeAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredRecipeQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredRecipeName,
                            type: "recipe",
                            image: requirement.requiredRecipeImage,
                            quantity: requirement.requiredRecipeQuantity,
                            isAllowed: requirement.isRecipeAllowed
                        })
                    }
                }
            }
            craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
            inventoryInstanceData.craft = {
                isAllowed: craftIsAllowed,
                probability: craftRequirements[0].chanceCraft,
                requirements: requirementsArray,
                hasGearBurn: hasGearBurn,
                hasCardBurn: hasCardBurn,
                hasConsumables: false,
                consumables: [],
                product: {
                    name: craftedName,
                    image: craftedImage,
                    quantity: (craftType == 'gear' ? 1 : craftRequirements[0].productQuantity)
                }
            }

            // let craftConsumables
            // try {
            //     craftConsumables = await InventoryQueries.getRecipeConsumables(address)
            // } catch (error) {
            //     logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
            //     throw error
            // }
            // inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
            // for (var i = 0; i < craftConsumables.length; ++i) {
            //     inventoryInstanceData.craft.consumables.push({
            //         id: craftConsumables[i].idItemConsumable,
            //         name: craftConsumables[i].name,
            //         image: craftConsumables[i].image,
            //         description: craftConsumables[i].description,
            //         quantity: craftConsumables[i].quantity
            //     })
            // }

            let maxPossibleCraftCount
            try {
                maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, inventoryInstanceRawData[0].idRecipe)
            } catch (error) {
                logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
                throw error
            }
            inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount


        }
        return inventoryInstanceData

    }

    static async getRecipeNPCInstanceData(address, idRecipe) {
        console.log('############# getInventoryInstanceData: ', address, idRecipe)
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getRecipeNpcInstancePVP(idRecipe, address)
            console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw 'The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }

        //if(inventoryInstanceRawData[0].isWithdrawable) inventoryInstanceData.maticRatio = inventoryInstanceRawData[0].maticRatio;

        let craftType, craftedName, craftedImage
        //PN gear PN1 item PN2 card
        if (inventoryInstanceRawData[0].productName1 == null && inventoryInstanceRawData[0].productName2 == null) {
            craftType = 'gear'
            craftedName = inventoryInstanceRawData[0].productName
            craftedImage = inventoryInstanceRawData[0].productImage
        } if (inventoryInstanceRawData[0].productName1 == null && inventoryInstanceRawData[0].productName == null) {
            craftType = "card"
            craftedName = inventoryInstanceRawData[0].productName2
            craftedImage = inventoryInstanceRawData[0].productImage2
        } if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName2 == null) {
            craftType = "item"
            craftedName = inventoryInstanceRawData[0].productName1;
            craftedImage = inventoryInstanceRawData[0].productImage1;
        }
        inventoryInstanceData.isAvailable = {
            craft: 1
        }
        let craftRequirements = []
        for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
            const row = inventoryInstanceRawData[i]
            craftRequirements.push(row)
        }
        let craftIsAllowed = true
        let requirementsArray = []
        let idGearRequirement = {}
        let hasToolBurn = false
        for (let requirement of craftRequirements) {
            if (requirement.idPointRequirement != null) {
                if (!(requirement.isPointsAllowed)) {
                    craftIsAllowed = false
                }
                if (requirement.requiredPoints != 0) {
                    requirementsArray.push({
                        name: 'PvpPoints',
                        type: "points",
                        image: serverConfig.PVPPOINTS_IMAGE,
                        quantity: requirement.requiredPoints,
                        isAllowed: requirement.isPointsAllowed
                    })
                }
            } else if (requirement.idItemRequirement != null) {
                if (!requirement.isItemAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredItemQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredItemName,
                        type: "item",
                        image: requirement.requiredItemImage,
                        quantity: requirement.requiredItemQuantity,
                        isAllowed: requirement.isItemAllowed
                    })
                }
            } else if (requirement.idGearRequirement != null && idGearRequirement[requirement.idGearRequirement] == undefined) {
                idGearRequirement[requirement.idGearRequirement] = true
                if (!requirement.isGearAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.burn) {
                    hasToolBurn = true
                }
                requirementsArray.push({
                    name: requirement.requiredGearName,
                    image: requirement.requiredGearImage,
                    quantity: 1,
                    type: "gear",
                    level: requirement.requiredGearLevel,
                    burn: requirement.burn,
                    isAllowed: requirement.isGearAllowed,
                    idToolLevel: requirement.requiredIdGearLevel
                })
            } else if (requirement.idRecipeRequirement != null) {
                if (!requirement.isRecipeAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredRecipeQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredRecipeName,
                        type: "recipe",
                        image: requirement.requiredRecipeImage,
                        quantity: requirement.requiredRecipeQuantity,
                        isAllowed: requirement.isRecipeAllowed
                    })
                }
            }
        }

        craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
        inventoryInstanceData.craft = {
            isAllowed: craftIsAllowed,
            probability: craftRequirements[0].chanceCraft,
            requirements: requirementsArray,
            hasToolBurn: hasToolBurn,
            hasConsumables: false,
            consumables: [],
            product: {
                name: craftedName,
                image: craftedImage,
                quantity: (craftType == 'gear' ? 1 : craftRequirements[0].productQuantity)
            }
        }

        // let craftConsumables
        // try {
        //     craftConsumables = await InventoryQueries.getRecipeConsumables(address)
        // } catch (error) {
        //     logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
        //     throw error
        // }
        // inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
        // for (var i = 0; i < craftConsumables.length; ++i) {
        //     inventoryInstanceData.craft.consumables.push({
        //         id: craftConsumables[i].idItemConsumable,
        //         name: craftConsumables[i].name,
        //         image: craftConsumables[i].image,
        //         description: craftConsumables[i].description,
        //         quantity: craftConsumables[i].quantity
        //     })
        // }

        let maxPossibleCraftCount
        try {
            maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount

        let recipesMax;
        let recipesAvailable;

        try {
            recipesMax = await RecipeQueries.getRecipesMaxAvailable(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipesAvailableMax: ${Utils.printErrorLog(error)}`)
            throw error;

        }
        if (recipesMax[0].max != null) {
            try {
                recipesAvailable = await RecipeQueries.getRecipesAvailable(idRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipesAvailable: ${Utils.printErrorLog(error)}`)
                throw error;
            }

            console.log('AV: ', recipesAvailable[0]?.available)

            inventoryInstanceData.isAvailable.max = recipesMax[0]?.max
            inventoryInstanceData.isAvailable.now = (
                recipesAvailable[0]?.available <= 0
                    ? 0
                    : recipesAvailable[0]?.available
            )

            if (inventoryInstanceData.isAvailable.now <= 0) {
                inventoryInstanceData.isAvailable.craft = 0;
            }

            if (inventoryInstanceData.maxPossibleCraftCount > recipesMax[0]?.maxCraft) {
                inventoryInstanceData.maxPossibleCraftCount = recipesMax[0]?.maxCraft
            }
        }


        return inventoryInstanceData

    }

    static async getMaxPossibleCraftCount(address, idRecipe) {
        let maxPossibleCraftCount = 100

        let checkRequirements
        try {
            checkRequirements = await InventoryQueries.getRecipeRequirementsByIdRecipe(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeRequirementsByIdRecipe: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        let currentResource
        try {
            currentResource = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error
        }
        let resourceRequirement = { pvpPoints: 0 }, itemRequirement = [], recipeRequirement = []
        for (const requirement of checkRequirements) {
            if (requirement.idPointRequirement != null) {
                if (currentResource.pvpPoints < requirement.requiredPoints) {
                    return 0
                }
                if (requirement.requiredPoints != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.pvpPoints / requirement.requiredPoints));
                }
                resourceRequirement = { pvpPoints: requirement.requiredPoints }
                logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
            } else if (requirement.idItemRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                    return 0
                }
                if (requirement.requiredItemBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredItemQuantity))
                    itemRequirement.push({ id: requirement.requiredIdItem, quantity: requirement.requiredItemQuantity, idInstance: check[0].idItemInstance, quantityInstance: check[0].quantity })
                    logger.debug(`item - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
                }
            } else if (requirement.idGearRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getGearQuantity(address, requirement.requiredIdGearLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length == 0) {
                    return 0
                }
                if (requirement.requiredGearBurn == 1) {
                    return 1
                }
            } else if (requirement.idRecipeRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                    return 0
                }
                if (requirement.requiredRecipeBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                    recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
                }
            }
        }

        return maxPossibleCraftCount
    }

    static async getInventoryListService(address) {
        logger.info(`getInventoryListService START`)
        let inventoryListRawData = []
        try {
            inventoryListRawData = await InventoryQueries.getInventoryListFromAddress(address)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getInventoryListFromAddress: ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let inventoryList = []
        for (var i = 0; i < inventoryListRawData.length; ++i) {
            let inventoryRawData = inventoryListRawData[i]
            inventoryList.push({
                id: inventoryRawData.id,
                idGearLevel: inventoryRawData.idGearLevel,
                bonuses: inventoryRawData.bonuses,
                type: inventoryRawData.type,
                category: inventoryRawData.category,
                isChest: inventoryRawData.isChest,
                quantity: inventoryRawData.quantity,
                name: inventoryRawData.name,
                image: inventoryRawData.image,
                durability: inventoryRawData.durability,
                level: inventoryRawData.level,
                rarity: inventoryRawData.rarity,
                menu: {
                    craft: inventoryRawData.craft,
                    view: inventoryRawData.view,
                    send: inventoryRawData.send,
                    sell: inventoryRawData.sell
                }
            })
        }

        logger.info(`getInventoryListService END`)
        return inventoryList
    }

    static async getCardListService(address) {
        let cardListRaw = []
        try {
            cardListRaw = await InventoryQueries.getCardListFromAddress(address)
        } catch (error) {
            logger.error(`Error in getCardListFromAddres :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let cardList = []

        for (let card of cardListRaw) {
            logger.debug(`single CARD : ${JSON.stringify(card)}`)

            let slotIds = [card.weaponSlot, card.shieldSlot, card.talismanSlot];

            let gears = await Promise.all(
                slotIds.map(async idGear => {
                    try {
                        let [gear] = await InventoryQueries.getGearFromIdgear(idGear);

                        if (!gear) return null;

                        return gear;
                    } catch (error) {
                        logger.error(`Error in  InventoryQueries.getGearFromIdgear :${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                })
            );

            cardList.push({
                ...this.buildCardResponse(card),
                weapon: gears[0],
                shield: gears[1],
                talisman: gears[2]
            })
        }

        return cardList
    }

    static buildCardResponse(card) {
        let response = {}
        // let upgradeRequirements = {}
        response.name = card.name;
        response.image = card.image;
        response.description = card.description;
        response.level = card.level;
        response.idCard = card.idCard;
        response.idCardLevel = card.idCardLevel;
        response.rarity = card.rarity;
        response.id = card.id;
        response.category = card.category;
        response.card_id = card.card_id;
        response.quantity = card.quantity;
        response.attack = card.attack;
        response.speed = card.speed;
        response.range = card.range;
        response.hp = card.hp;
        response.weaponSlot = card.weaponSlot;
        response.shieldSlot = card.shieldSlot;
        response.talismanSlot = card.talismanSlot;
        response.buffPercentage = card.buffPercentage;
        response.buffAttribute = card.buffAttribute;
        response.buffCategory = card.buffCategory

        // upgradeRequirements.cardQuantity = card.requiredCards
        // upgradeRequirements.isCardAllowed = card.isCardAllowed
        // response.upgradeRequirements = upgradeRequirements

        return response
    }

    static async getCardInstanceService(address, idCardInstance) {
        let cardInstance;
        let items;
        let nextLevel;
        let allGearAvailable;
        let result = {};

        try {
            [cardInstance] = await InventoryQueries.getCardInstanceFromAddress(address, idCardInstance);

            if (!cardInstance) {
                return {
                    success: false,
                    status: 401,
                    errorMessage: 'You don\'t have that card',
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries getCardInstanceFromAddress : ${Utils.printErrorLog(error)} `)
            throw (error)
        }

        let cardLevel = cardInstance.level
        let currentIdCard = cardInstance.idCard
        if (cardInstance.isUpgradable) {
            let nextLevel
            try {
                [nextLevel] = await CardQueries.getNextCardLevelByIdCardAndLevel(currentIdCard, cardLevel)
            } catch (error) {
                logger.error(`Error in CardQueries getNextCardLevelByIdCardAndLevel : ${Utils.printErrorLog(error)} `)
                throw error
            }
            console.log("nextLev", nextLevel)

            try {
                items = await InventoryQueries.getItemRequirementsFromAddressAndIdCardLevel(address, nextLevel.idCardLevel);
            } catch (error) {
                logger.error(`Error in InventoryQueries getItemRequirementsFromAddressAndIdCardLevel : ${Utils.printErrorLog(error)} `)
                throw (error)
            }
        }



        let { idCard, level, idCardLevel,category, pvpPoints, upgradePointsRequired, isUpgradable: cardUpgradable } = cardInstance;

        let { weaponSlot, shieldSlot, talismanSlot } = cardInstance;
        let gearSlots = [weaponSlot, shieldSlot, talismanSlot];

        gearSlots = await Promise.all(
            gearSlots.map(async idGear => {
                try {
                    let [slot] = await InventoryQueries.getGearInfoFromAddressAndIdGear(address, idGear);

                    if (!slot) return null;

                    let isUpgradable = slot && Boolean(slot.isUpgradable);
                    let isEquipable = slot && Boolean(slot.isEquipable);

                    return { ...slot, isUpgradable, isEquipable }

                } catch (error) {
                    logger.error(`Error in InventoryQueries getGearInfoFromAddressAndIdGear : ${Utils.printErrorLog(error)} `)
                    throw (error)
                }
            })
        );

        let gearsAvailableByType = ['weapon', 'shield', 'talisman'];

        try {
            allGearAvailable = await InventoryQueries.getAllGearAvailableFromAddress(address);
            gearsAvailableByType = gearsAvailableByType.map(type => {
                return allGearAvailable
                    .filter(gear => {
                        if (gear.onCard) {
                            return gear.onCard === idCard && gear.type === type;
                        }else if (gear.onCategory){
                            return gear.onCategory.includes(category) && gear.type === type;
                        }
                         else {
                            return gear.type === type;
                        }
                    })
                    .map(gear => {
                        let isUpgradable = Boolean(gear.isUpgradable);
                        let isEquipable = Boolean(gear.isEquipable);

                        return { ...gear, isUpgradable, isEquipable }
                    });
            });
        } catch (error) {
            logger.error(`Error in InventoryQueries getAllGearAvailableFromAddress : ${Utils.printErrorLog(error)} `)
            throw (error);
        }

        let areItemsUpgradable = true
        if (items && items.length == 1) {
            items = items[0]
            if (items.quantity == null) areItemsUpgradable = false
            if (items.quantity < items.upgradeItemQuantity) areItemsUpgradable = false
        }
        if (items && items.length > 1) {
            for (let item of items) {
                if (item.quantity == null) areItemsUpgradable = false
                if (item.quantity < item.upgradeItemQuantity) areItemsUpgradable = false
                //delete item.quantity;
            }
        }

        console.log("items are >", items)

        let upgradeRequirements = [
            {
                pvpPoints: upgradePointsRequired,
            },
            // {
            //     idCard,
            //     idCardLevel,
            //     level,
            // },
            items,
        ];

        let isUpgradable = pvpPoints > upgradePointsRequired && areItemsUpgradable && Boolean(cardUpgradable);
        delete cardInstance.idCard;
        delete cardInstance.pvpPoints;
        delete cardInstance.upgradePointsRequired;


        result = {
            ...cardInstance,
            upgradeRequirements,
            isUpgradable,
            weaponSlot: gearSlots[0],
            weaponsAvailable: gearsAvailableByType[0],
            shieldSlot: gearSlots[1],
            shieldsAvailable: gearsAvailableByType[1],
            talismanSlot: gearSlots[2],
            talismansAvailable: gearsAvailableByType[2],
        }

        if (isUpgradable) {
            try {
                [nextLevel] = await InventoryQueries.getCardStatsGivenIdCardAndLevel(idCard, level + 1);
            } catch (error) {
                logger.error(`Error in InventoryQueries getCardStatsGivenIdCardAndLevel : ${Utils.printErrorLog(error)} `)
                throw (error)
            }

            result = { ...result, nextLevel, }
        }

        return {
            success: true,
            data: {
                data: result
            }
        }
    }

    static async getLeaderboardService(address, idLeague) {
        let user;
        let league;
        let rankedPlayers;

        try {
            [user] = await UserQueries.getUser(address);
        } catch (error) {
            logger.error(`Error in InventoryQueries getUser : ${Utils.printErrorLog(error)} `)
            throw (error)
        }

        if (!idLeague) idLeague = user.idLeague;

        try {
            [league] = await InventoryQueries.getLeagueFromIdLeague(idLeague);
        } catch (error) {
            logger.error(`Error in InventoryQueries getLeagueFromIdLeague : ${Utils.printErrorLog(error)} `)
            throw (error)
        }

        if (!league) {
            logger.debug(`getLeagueFromIdLeague response: ${JSON.stringify(league)}`)
            return 'This user does not have an active League';
        }


        try {
            let players = await InventoryQueries.getPlayersRankedInLeague(idLeague);

            rankedPlayers = players.map(player => {
                return {
                    ...player,
                    isUser: player.address === address,
                }
            })

        } catch (error) {
            logger.error(`Error in InventoryQueries getPlayersRankedInLeague : ${Utils.printErrorLog(error)} `)
            throw (error)
        }

        let rewards
        try {
            rewards = await InventoryQueries.getRewardsFromIdLeague(idLeague);
        } catch (error) {
            logger.error(`Error in InventoryQueries getRewardsFromIdLeague : ${Utils.printErrorLog(error)} `)
            throw (error)
        }
        logger.debug(`Retrieved rewards: ${JSON.stringify(rewards)}`)

        //the filter clear every property of the object if one occurence of that property is null
        // make sure to select all the relevant data with different name
        for (let reward of rewards) {
            for (let propName in reward) {
                if (reward[propName] == null || reward[propName] == undefined) {
                    delete reward[propName];
                }
            }
        }



        return {
            league,
            players: rankedPlayers,
            rewards: rewards,
            endSeason: serverConfig.matchmaking.SEASONENDDATE
        }
    }

    static async getWarHistory(address) {
        let warList = [];
        let warHistory = [];

        try {
            warList = await InventoryQueries.getWarsFromAddress(address);

        } catch (error) {
            logger.error(`Error in InventoryQueries getWarsFromAddress : ${Utils.printErrorLog(error)} `)
            throw (error)
        }

        warHistory = await Promise.all(
            warList.map(async war => {

                let enemyAddress = war.address1 !== address ? war.address1 : war.address2
                let win = war.winner === address;

                try {
                    let [enemyData] = await UserQueries.getUser(enemyAddress);

                    if (!enemyData) {
                        return {
                            idWar: war.idWar,
                            win: win || null,
                            enemyAddress,
                            enemyData: null,
                            endingTime: war.endingTime
                        }
                    }

                    return {
                        idWar: war.idWar,
                        win: win || null,
                        enemyAddress,
                        enemyName: enemyData.name || null,
                        enemyImage: enemyData.image || null,
                        enemyTrophies: enemyData.warPoints || null,
                        endingTime: war.endingTime
                    }
                } catch (error) {
                    logger.error(`Error in UserQueries.getUser : ${Utils.printErrorLog(error)} `)
                    throw (error)
                }
            })
        );

        return warHistory;
    }

    static async upgradeGear(address, idGearInstance, consumableIds) {
        let result
        try {
            result = await GearService.upgrade(address, idGearInstance, consumableIds)
        } catch (error) {
            logger.error(`Error in GearService.upgrade: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let inventoryInstanceData;
        try {
            inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idGearInstance, 'gear')
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (result.inventory != undefined) {
            result.inventory.map(obj => {
                if (obj != null && obj != undefined && obj.action == 'edit') obj.elements.push(inventoryInstanceData)
                return obj
            })
        }

        return result
    }

    static async upgradeCard(address, idCardInstance, consumableIds) {
        let result
        try {
            result = await CardService.upgrade(address, idCardInstance, consumableIds)
        } catch (error) {
            logger.error(`Error in CardService.upgrade: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let inventoryInstanceData;
        try {
            inventoryInstanceData = await InventoryQueries.getCardInstanceData(idCardInstance)
            if (inventoryInstanceData.length == 1) {
                inventoryInstanceData = inventoryInstanceData[0]
                inventoryInstanceData.type = 'card'
            }
        } catch (error) {
            logger.error(`Error in inventoryService.getCardInstanceService: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (result.inventory != undefined) {
            result.inventory.map(obj => {
                if (obj != null && obj != undefined && obj.action == 'edit') obj.elements.push(inventoryInstanceData)
                return obj
            })
        }

        return result
    }

    static async sendRecipeService(senderAddress, receiverAddress, idRecipeInstance, quantity) {

        let senderRecipeInstance;
        let receiverHasARecipe;
        let senderQuantityAfterSent;

        if (senderAddress === receiverAddress) {
            return {
                success: false,
                errorMessage: 'Not allowed to send to your own address',
                status: 200,
            }
        }

        try {
            [senderRecipeInstance] = await RecipeQueries.getRecipeInstanceByAddressAndIdRecipeInstance(senderAddress, idRecipeInstance);

            if (!senderRecipeInstance) {
                return {
                    success: false,
                    errorMessage: 'You haven\'t got that recipe',
                    status: 401,
                }
            }

            if (senderRecipeInstance.quantity < quantity) {
                return {
                    success: false,
                    errorMessage: 'You don\'t have enough recipes',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in RecipeQueries.getRecipeInstanceByAddressAndIdRecipeInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }

        try {
            let recipeMenu = await RecipeQueries.getMenuByIdRecipeInstance(idRecipeInstance);

            if (!recipeMenu.send) {
                return {
                    success: false,
                    errorMessage: 'Send is not allowed',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in RecipeQueries.getMenuByIdRecipeInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }


        try {
            let [receiverUser] = await UserQueries.getUser(receiverAddress);

            if (!receiverUser) {
                return {
                    success: false,
                    errorMessage: 'The receiver user does not exists',
                    status: 200,
                }
            }
        } catch (error) {
            logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let { idRecipe } = senderRecipeInstance;

        try {
            [receiverHasARecipe] = await RecipeQueries.checkIfUserHasRecipe(receiverAddress, idRecipe);
        } catch (error) {
            logger.error(`Error in RecipeQueries.checkIfUserHasRecipe: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let senderUpdate;
        try {
            senderUpdate = await RecipeQueries.subRecipeByIdRecipeAndAddress(senderAddress, idRecipe, quantity);
        } catch (error) {
            logger.error(`Error in RecipeQueries.subRecipeByIdRecipeAndAddress: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (senderUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        if (!receiverHasARecipe) {
            try {
                await RecipeQueries.createRecipeInstanceByAddressIdRecipeQuantity(receiverAddress, idRecipe, quantity);
            } catch (error) {
                logger.error(`Error in RecipeQueries.createRecipeInstanceByAddressIdRecipeQuantity: ${Utils.printErrorLog(error)}`)
                throw error
            }
        } else {
            try {
                await RecipeQueries.addRecipeByIdRecipeAndAddress(receiverAddress, idRecipeInstance, quantity);
            } catch (error) {
                logger.error(`Error in RecipeQueries.addRecipeByIdRecipeAndAddress: ${Utils.printErrorLog(error)}`)
                throw error
            }
        }

        let editElements = [];
        let removeElements = [];

        try {
            senderQuantityAfterSent = await RecipeQueries.getRecipeQuantityByAddressAndIdRecipe(senderAddress, idRecipe);
        } catch (error) {
            logger.error(`Error in RecipeQueries.getRecipeQuantityByAddressAndIdRecipe: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (senderQuantityAfterSent.quantity === 0) {
            try {
                await RecipeQueries.deleteRecipeInstanceByAddressAndIdRecipeInstance(senderAddress, idRecipeInstance);
            } catch (error) {
                logger.error(`Error in RecipeQueries.deleteRecipeInstanceByAddressAndIdRecipeInstance: ${Utils.printErrorLog(error)}`)
                throw error
            }
        }

        if (senderQuantityAfterSent.quantity === 0) {
            removeElements.push({
                id: idRecipeInstance,
                type: 'recipe'
            })
        } else {
            editElements.push({
                id: idRecipeInstance,
                type: 'recipe',
                quantity: senderQuantityAfterSent.quantity,
            })
        }

        let inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        return {
            success: true,
            data: {
                done: true,
                addressReceiver: receiverAddress,
                idRecipe,
                quantity,
                inventory,
            }
        }
    }


    static async sendItemService(senderAddress, receiverAddress, idItemInstance, quantity) {

        logger.info('sendItemService START');

        let senderItemData;
        let receiverHasItem;
        let senderQuantityAfterSent;

        if (senderAddress === receiverAddress) {
            return {
                success: false,
                errorMessage: 'Not allowed to send to your own address',
                status: 200,
            }
        }

        try {
            senderItemData = await ItemQueries.getItemInstanceByAddressAndIdItemInstance(senderAddress, idItemInstance);

            if (!senderItemData) {
                return {
                    success: false,
                    errorMessage: 'You haven\'t got that recipe',
                    status: 401,
                }
            }

            if (senderItemData.quantity < quantity) {
                return {
                    success: false,
                    errorMessage: 'You don\'t have enough items',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in ItemQueries.getItemInstanceByAddress: ${Utils.printErrorLog(error)}`)
            throw error
        }

        try {
            let [receiverUser] = await UserQueries.getUser(receiverAddress);

            if (!receiverUser) {
                return {
                    success: false,
                    errorMessage: 'The receiver user does not exists',
                    status: 401,
                }
            }
        } catch (error) {
            logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`)
            throw error
        }

        try {
            let itemMenu = await ItemQueries.getMenuByIdItemInstance(idItemInstance);

            if (!itemMenu.send) {
                return {
                    success: false,
                    errorMessage: 'Send is not allowed',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in ItemQueries.getMenuByIdItemInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let { idItem } = senderItemData;

        try {
            [receiverHasItem] = await ItemQueries.checkIfUserHasItem(receiverAddress, idItem);

        } catch (error) {
            logger.error(`Error in ItemQueries.checkIfUserHasItem: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let senderUpdate;
        try {
            senderUpdate = await ItemQueries.subItemByIdItemAndAddress(senderAddress, idItem, quantity);
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (senderUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        if (!receiverHasItem) {
            try {
                await ItemQueries.createItemInstanceByAddressIdItemQuantity(receiverAddress, idItem, quantity);

            } catch (error) {
                logger.error(`Error in ItemQueries.createItemInstanceByAddressIdItemQuantity: ${Utils.printErrorLog(error)}`)
                throw error
            }
        } else {
            try {
                await ItemQueries.addItemByIdItemAndAddress(receiverAddress, idItem, quantity);
            } catch (error) {
                logger.error(`Error in ItemQueries.addItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
                throw error
            }
        }

        try {
            senderQuantityAfterSent = await ItemQueries.getItemQuantityByAddressAndIdItem(senderAddress, idItem);
        } catch (error) {
            logger.error(`Error in ItemQueries.getItemQuantityByAddressAndIdItem: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (senderQuantityAfterSent.quantity === 0) {
            try {
                await ItemQueries.deleteItemInstanceByAddressAndIdItemInstance(senderAddress, idItemInstance);
            } catch (error) {
                logger.error(`Error in ItemQueries.deleteItemInstanceByAddressAndIdItemInstance: ${Utils.printErrorLog(error)}`)
                throw error;
            }
        }

        let editElements = [];
        let removeElements = [];

        if (senderQuantityAfterSent.quantity === 0) {
            removeElements.push({
                id: idItemInstance,
                type: 'item'
            })
        } else {
            editElements.push({
                id: idItemInstance,
                type: 'item',
                quantity: senderQuantityAfterSent.quantity,
            })
        }

        let inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        logger.info('sendItemService END');

        return {
            success: true,
            data: {
                done: true,
                receiverAddress,
                idItem,
                quantity,
                inventory,
            }
        }
    }

    static async sendCardService(addressSender, addressReceiver, idCardInstance) {

        logger.info('sendCardService START')

        let senderCardInstance;
        let senderUpdate;
        let receiverUpdate;

        if (addressSender === addressReceiver) {
            return {
                success: false,
                errorMessage: 'Not allowed to send to your own address',
                status: 200,
            }
        }

        try {
            [senderCardInstance] = await InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance(
                addressSender,
                idCardInstance
            );

            if (!senderCardInstance) {
                return {
                    success: false,
                    errorMessage: 'You haven\'t got that card',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        try {
            let [receiverUser] = await UserQueries.getUser(addressReceiver);

            if (!receiverUser) {
                return {
                    success: false,
                    errorMessage: 'The receiver user does not exists',
                    status: 401,
                }
            }
        } catch (error) {
            logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let { idCard, idCardLevel, isSendable, weaponSlot, shieldSlot, talismanSlot } = senderCardInstance;

        if (!isSendable) {
            return {
                success: false,
                errorMessage: 'Send is not allowed',
                status: 401,
            }
        }

        try {
            senderUpdate = await InventoryQueries.removeCardInstance(idCardInstance);
        } catch (error) {
            logger.error(`Error in InventoryQueries.removeCardInstance: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        if (senderUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        let cardSlots = [weaponSlot, shieldSlot, talismanSlot];

        cardSlots.forEach(async slot => {
            if (slot) {
                try {
                    await InventoryQueries.unequipGearFromIdGearInstance(slot);
                } catch (error) {
                    logger.error(`Error in InventoryQueries.unequipGearFromIdGearInstance: ${Utils.printErrorLog(error)}`)
                    throw error;
                }
            }
        });

        try {
            receiverUpdate = await InventoryQueries.createCardInstanceGivenAddressIdcardAndIdcardlevel(
                addressReceiver,
                idCard,
                idCardLevel
            );
        } catch (error) {
            logger.error(`Error in InventoryQueries.createCardInstanceGivenAddressIdcardAndIdcardlevel: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        if (receiverUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        let inventory = [
            {
                action: 'remove',
                elements: {
                    id: idCardInstance,
                    type: 'card'
                }
            }
        ];

        logger.info('sendCardService END');

        return {
            success: true,
            data: {
                done: true,
                addressReceiver,
                idCard,
                inventory,
            }
        }
    }

    static async sendGearService(addressSender, addressReceiver, idGearInstance) {

        logger.info('sendGearService START');

        let gearInstanceData;
        let senderUpdate;
        let receiverUpdate;

        if (addressSender === addressReceiver) {
            return {
                success: false,
                errorMessage: 'Not allowed to send to your own address',
                status: 200,
            }
        }

        try {
            [gearInstanceData] = await InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress(
                idGearInstance,
                addressSender
            );

            if (!gearInstanceData) {
                return {
                    success: false,
                    errorMessage: 'You haven\'t got that gear',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getGearInstanceData: ${Utils.printErrorLog(error)}`);
            throw error;
        }


        try {
            let [receiverUser] = await UserQueries.getUser(addressReceiver);

            if (!receiverUser) {
                return {
                    success: false,
                    errorMessage: 'The receiver user does not exists',
                    status: 401,
                }
            }
        } catch (error) {
            logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        let { idGear, idGearLevel, equipped, isSendable } = gearInstanceData;

        if (equipped) {
            return {
                success: false,
                errorMessage: 'You cannot send an equipped gear',
                status: 401,
            }
        }

        if (!isSendable) {
            return {
                success: false,
                errorMessage: 'Send is not allowed',
                status: 401,
            }
        }

        try {
            senderUpdate = await InventoryQueries.removeGearInstance(idGearInstance);
        } catch (error) {
            logger.error(`Error in InventoryQueries.removeGearInstance: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (senderUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        try {
            receiverUpdate = await InventoryQueries.createGearInstanceGivenAddressIdGearAndIdgearlevel(
                addressReceiver,
                idGear,
                idGearLevel
            );
        } catch (error) {
            logger.error(`Error in InventoryQueries.createGearInstanceGivenAddressIdGearAndIdgearlevel: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (receiverUpdate.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        let inventory = [
            {
                action: 'remove',
                elements: [{
                    id: idGearInstance,
                    type: 'gear'
                }]
            }
        ];

        logger.info('sendGearService END');

        return {
            success: true,
            data: {
                done: true,
                addressReceiver,
                idGear,
                inventory,
            }
        }
    }

    static async changeGearService(address, idCardInstance, idGearInstance, slot) {

        let cardInstanceInfo;
        let cardInfo;
        let gearEquipped = null;
        let gearToChange;
        let slotToChange = '';
        let cardSlotUpdated;
        let gearUpdated;
        let gearUnequipped;

        try {
            [cardInstanceInfo] = await InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance(
                address,
                idCardInstance,
            )

            if (!cardInstanceInfo) {
                return {
                    success: false,
                    errorMessage: 'You don\'t have that card',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (cardInstanceInfo.isBattling) {
            return {
                success: false,
                errorMessage: 'You cannot modify a gear if the card is battling',
                status: 401,
            }
        }

        let idCard = cardInstanceInfo.idCard;

        try {
            cardInfo = await InventoryQueries.getCardInfoGivenIdCard(idCard);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getCardInfoGivenIdCard: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (cardInfo.rarity === 'LEGENDARY') {
            return {
                success: false,
                errorMessage: 'You cannot equip gear to legendary cards',
                status: 401
            }
        }

        let { weaponSlot, shieldSlot, talismanSlot } = cardInstanceInfo;

        if (slot === 'weapon') {
            try {
                let [weaponEquipped] = await InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress(
                    weaponSlot,
                    address
                );

                if (weaponEquipped) {
                    gearEquipped = weaponEquipped;
                }

                slotToChange = 'weaponSlot';

            } catch (error) {
                logger.error(`Error in InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        if (slot === 'shield') {
            try {
                let [shieldEquipped] = await InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress(
                    shieldSlot,
                    address
                );

                if (shieldEquipped) {
                    gearEquipped = shieldEquipped;
                }

                slotToChange = 'shieldSlot';

            } catch (error) {
                logger.error(`Error in InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        if (slot === 'talisman') {
            try {
                let [talismanEquipped] = await InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress(
                    talismanSlot,
                    address
                );

                if (talismanSlot) {
                    gearEquipped = talismanEquipped;
                }

                slotToChange = 'talismanSlot';

            } catch (error) {
                logger.error(`Error in InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        try {
            [gearToChange] = await InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress(
                idGearInstance,
                address
            )

            if (!gearToChange) {
                return {
                    success: false,
                    errorMessage: 'You don\'t have that gear',
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getGearInstanceDataFromIdgearinstanceAndAddress`);
            throw error;
        }

        if (gearEquipped && gearToChange.idGearInstance === gearEquipped.idGearInstance) {
            return {
                success: false,
                errorMessage: 'You already have that item equipped',
                status: 200,
            }
        }

        if (slot !== gearToChange.type) {
            return {
                success: false,
                errorMessage: 'Incorrect type slot',
                status: 401,
            }
        }


        if(gearToChange.onCard){
            if(idCard != gearToChange.onCard)
            return { success: false,
            errorMessage: 'Incorrect type slot',
            status: 401,
            }
        }

        if(gearToChange.onCategory){
            if(!gearToChange.onCategory.includes(cardInfo.category))
            return { success: false,
            errorMessage: 'Incorrect type slot',
            status: 401,
            }
        }

        if (!gearEquipped) {

            try {
                cardSlotUpdated = await InventoryQueries.updateSlotInCardInstanceGivenSlotAndIdcardinstance(
                    slotToChange,
                    idGearInstance,
                    idCardInstance
                );
            } catch (error) {
                logger.error(`Error in InventoryQueries.updateSlotInCardInstanceGivenSlotAndIdcardinstance: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            try {
                gearUpdated = await InventoryQueries.equipGearFromIdGearInstance(
                    idCardInstance,
                    idGearInstance
                );
            } catch (error) {
                logger.error(`Error in InventoryQueries.equipGearFromIdGearInstance: ${Utils.printErrorLog(error)}`);
                throw error;
            }

        } else {

            try {
                cardSlotUpdated = await InventoryQueries.updateSlotInCardInstanceGivenSlotAndIdcardinstance(
                    slotToChange,
                    idGearInstance,
                    idCardInstance
                );
            } catch (error) {
                logger.error(`Error in InventoryQueries.updateSlotInCardInstanceGivenSlotAndIdcardinstance: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            try {
                gearUpdated = await InventoryQueries.equipGearFromIdGearInstance(
                    idCardInstance,
                    idGearInstance
                );
            } catch (error) {
                logger.error(`Error in InventoryQueries.equipGearFromIdGearInstance: ${Utils.printErrorLog(error)}`);
                throw error;
            }

            try {
                gearUnequipped = await InventoryQueries.unequipGearFromIdGearInstance(
                    gearEquipped.idGearInstance
                );
            } catch (error) {
                logger.error(`Error in InventoryQueries.unequipGearFromIdGearInstance: ${Utils.printErrorLog(error)}`);
                throw error;
            }

        }

        if (cardSlotUpdated.affectedRows !== 1 || gearUpdated.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        if (gearUnequipped && gearUnequipped.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        let editElements = [];

        editElements.push(
            {
                id: idGearInstance,
                type: 'gear',
            },
            {
                id: idCardInstance,
                type: 'card'
            }
        );

        let inventory = [
            {
                action: 'edit',
                elements: editElements
            },
        ];

        return {
            success: true,
            data: {
                done: true,
                address,
                idGear: gearToChange.idGear,
                idCard,
                inventory,
            }
        }
    }

    static async unequipGearService(address, idCardInstance, idGearInstance) {

        let cardInfo;
        let cardSlotUnequipped;
        let gearUnequipped;
        let slotToUnequip;
        let equippedSlot;

        try {
            [cardInfo] = await InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance(
                address,
                idCardInstance
            );
        } catch (error) {
            logger.error(`Error in InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (cardInfo.isBattling) {
            return {
                success: false,
                errorMessage: 'You cannot modify a gear if the card is battling',
                status: 401,
            }
        }

        let { weaponSlot, shieldSlot, talismanSlot } = cardInfo;

        if (weaponSlot === idGearInstance) {
            equippedSlot = weaponSlot;
            slotToUnequip = 'weaponSlot';
        }

        if (shieldSlot === idGearInstance) {
            equippedSlot = shieldSlot;
            slotToUnequip = 'shieldSlot';
        }

        if (talismanSlot === idGearInstance) {
            equippedSlot = talismanSlot;
            slotToUnequip = 'talismanSlot';
        }

        if (!equippedSlot) {
            return {
                success: false,
                errorMessage: 'You don\'t have that gear equipped',
                status: 200,
            }
        }

        try {
            cardSlotUnequipped = await InventoryQueries.unequipGearSlotFromIdcardinstanceGivenSlotAndIdcardinstance(
                slotToUnequip,
                idCardInstance
            );
        } catch (error) {
            logger.error(`Error in InventoryQueries.unequipGearSlotFromIdcardinstanceGivenSlotAndIdcardinstance: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        try {
            gearUnequipped = await InventoryQueries.unequipGearFromIdGearInstance(idGearInstance);
        } catch (error) {
            logger.error(`Error in InventoryQueries.unequipGearFromIdGearInstance: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (cardSlotUnequipped.affectedRows !== 1 || gearUnequipped.affectedRows !== 1) {
            return {
                success: false,
                errorMessage: `We are happy that you are forcing the APIs, 
                remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`,
                status: 401,
                logIp: true,
            }
        }

        let removeElements = [];

        removeElements.push(
            {
                id: idCardInstance,
                type: 'card',
            },
            {
                id: idGearInstance,
                type: 'gear',
            }
        );

        let inventory = [
            {
                action: 'remove',
                elements: removeElements,
            }
        ];

        return {
            success: true,
            data: {
                done: true,
                address,
                idCard: cardInfo.idCard,
                inventory,
            }
        }
    }

    static async createBattleService(address, idWar, idArena, cards, legendaryIds) {
        let arena;
        let user;
        logger.debug(`Cards are : ${JSON.stringify(cards)}`)
        try {
            [user] = await UserQueries.getUser(address);

            if (!user) {
                return {
                    success: false,
                    errorMessage: 'This user does not exists',
                    status: 401
                }
            }

        } catch (error) {
            logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        try {
            arena = await InventoryQueries.getArenaFromIdArena(idArena);

            if (!arena) {
                return {
                    success: false,
                    errorMessage: `Incorrect Arena`,
                    status: 401,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getArenaFromIdArena: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let arenaRows = arena.rangeNumber;
        let arenaColumns = arena.numberColumns;
        let count = {};
        
        // * Get an array of arrays [row, col] per turn played, which has to be the same as the arena
        let dispositonPerTurn = []

        for (let i = 0; i < cards.length; i++) {
            let disposition = cards[i];

            let row = 0;
            let cols = [];

            // * Checks if are repeated cards in the matrix
            // let cardsDisplayed = disposition.flat(2).filter(card => card !== null);

            // let areRepeatedCards = cardsDisplayed.some((card, index) => index !== cardsDisplayed.indexOf(card))

            // if (areRepeatedCards) {
            //     return {
            //         success: false,
            //         errorMessage: `There cannot be repeated cards`,
            //         status: 401,
            //     }
            // }

            for (let j = 0; j < disposition.length; j++) {
                row++;
                cols.push(disposition[j].length)
            }

            let col;

            if (!cols.every(col => col === arenaColumns)) {
                col = cols.find(col => col !== arenaColumns)
            } else {
                col = cols.find(col => col === arenaColumns);
            }

            dispositonPerTurn.push([row, col])
        }

        // * Check if all elements in the [row, col] array are the dimensions given from the DB
        let correctDisposition = dispositonPerTurn.every(matrix => {
            return matrix[0] === arenaRows && matrix[1] === arenaColumns
        });

        if (!correctDisposition) {
            return {
                success: false,
                errorMessage: `Incorrect cards disposition, only ${arenaRows}x${arenaColumns} matrices are valid`,
                status: 401,
            }
        }
        let idx=0;
        for(let matrix of cards){
            let turnCount={}
            let flattedMatrix = matrix.flat(1).filter(card => card !== null);
            logger.debug(`Flatted turn is ${JSON.stringify(flattedMatrix)}`);

            flattedMatrix.forEach(function(i) { (turnCount[i]) = ( turnCount[i]||0) + 1;});
            count[idx]=turnCount;
            logger.debug(`The turn occurencies are ${JSON.stringify(turnCount)}`)
            idx++;
        }
        logger.debug(`Occurencies of each card played:${JSON.stringify(count)}`)

        let flattedCards = cards.flat(2).filter(card => card !== null);
        logger.debug(`Flatted cards : ${JSON.stringify(flattedCards)}`)


        // * Set all the values in the matrix to avoid repetition and unnecesary db querying
        let setAllCards = [... new Set(flattedCards)];
        logger.debug(`Flatted cards without repetitions : ${JSON.stringify(setAllCards)}`)

        // * Check if the cardInstances are in the DB
        let cardsSelectedByUser = await Promise.all(
            setAllCards.map(async card => {
                try {
                    let cardInstance = await InventoryQueries.getCardInstanceFromIdCardInstance(card, address);

                    return cardInstance;
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getCardInstanceFromIdCardInstance: ${Utils.printErrorLog(error)}`);
                    throw error;
                }
            })
        );

        logger.debug(`The list of cards selected by the user are: ${JSON.stringify(cardsSelectedByUser)}`);

        let check = this.checkMaxPlacement(count,cardsSelectedByUser);

        if(!check){
            return {
                success: false,
                errorMessage: `You are forcing the API, placing an incorrect number of cards`,
                status: 401,
            }
        }



        // * Checks if the user owns all the cards requested
        let userOwnsSelectedCards = cardsSelectedByUser.every(card => card !== undefined);



        if (!userOwnsSelectedCards) {
            return {
                success: false,
                errorMessage: `You don't own all the cards selected`,
                status: 401,
            }
        }

        // * Get an array of affixIds per turn played, if theres no value set to null
        let affixHistory;

        try {
            affixHistory = await InventoryQueries.getAffixHistoryFromIdWar(idWar);

            affixHistory = Object.values(affixHistory);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getAffixHistoryFromIdWar: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        // * Check if user plays using a legendary card and save it to DB
        for (let card of legendaryIds) {
            if (card != null) {
                let checkLeg
                try {
                    checkLeg = await InventoryQueries.getLegendaryOwnership(address, card)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getLegendaryOwnership: ${Utils.printErrorLog(error)}`);
                    throw error;
                }
                if (checkLeg.length != 1) throw ("The legendary card is not owned by the user")
            }
        }
        // * Saving battle into the DB
        for (let i = 0; i < 3; i++) {
            try {
                let turn = i + 1;
                let legendaryCard;
                if (legendaryIds[i] != null) legendaryCard = legendaryIds[i]

                let newBattle = await InventoryQueries.createBattle(
                    idWar,
                    turn,
                    address,
                    JSON.stringify(cards[i]),
                    legendaryCard,
                    affixHistory[i] || null,
                );

                if (newBattle.affectedRows !== 1) {
                    return {
                        success: false,
                        errorMessage: `We are happy that you are forcing the APIs, 
                        remember that we have bug bounties if you find something.
                        But also remember that we are logging everything.
                        Unauthorized access is illegal.`,
                        status: 401,
                        logIp: true,
                    }
                }

            } catch (error) {
                logger.error(`Error in InventoryQueries.createBattle: ${Utils.printErrorLog(error)}`);
                throw error;
            }
        }

        return {
            success: true,
            data: {
                done: true,
                // address, idWar, idArena, cards
            }
        }
    }

    static checkMaxPlacement(turnObject,cardInfos){
        for(let card of cardInfos){
            let max
            let idCardInstance = card.idCardInstance
            switch (card.rarity) {
                case "NORMAL":
                    max=serverConfig.matchmaking.cardLimits.COMMON
                    break;
                
                case "RARE":
                    max=serverConfig.matchmaking.cardLimits.RARE
                    break;
                case "EPIC":
                    max=serverConfig.matchmaking.cardLimits.EPIC
                    break;
            }
            for(let property in turnObject){
                if(turnObject[property].idCardInstance){
                    if(turnObject[property][idCardInstance]>max)
                    logger.warn(`Warning , the user forced FE to place the card : ${idCardInstance} this number of times ${turnObject[property][idCardInstance]} `)
                    return false
                }
            }
        }
        return true;
    }

    static async getRecipeNPCService() {
        let recipeList;

        try {
            recipeList = await InventoryQueries.getNPCRecipes();

            if (recipeList.length > 0) {
                recipeList = recipeList.map(recipe => {
                    return {
                        id: recipe.id,
                        name: recipe.name,
                        image: recipe.image,
                        rarity: recipe.rarity,
                        category: recipe.category,
                        idGear:recipe.idGear,
                        idCard:recipe.idCard,
                        idItem:recipe.idItem
                    }
                });
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getPvpNPCRecipes: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        return recipeList;
    }

    static async getPvpRecipeNPCInstanceService(address, idRecipe) {
        let recipe;
        let craftRequirements = [];
        let craftType, craftedName, craftedImage, quantityCraft

        try {
            recipe = await InventoryQueries.getRecipeFromIdRecipe(idRecipe);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeFromIdRecipe: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        if (recipe.cardName == null && recipe.itemName == null) {
            craftType = 'gear'
            craftedName = recipe.gearName
            craftedImage = recipe.gearImage
            quantityCraft = 1
        } if (recipe.itemName == null && recipe.gearName == null) {
            craftType = "card"
            craftedName = recipe.cardName
            craftedImage = recipe.cardImage
            quantityCraft = 1
        } if (recipe.cardName == null && recipe.gearName == null) {
            craftType = "item"
            craftedName = recipe.itemName;
            craftedImage = recipe.itemImage;
            quantityCraft = recipe.itemQuantity
        }

        let idItemRequirement;
        let idPointRequirement;
        let idGearRequirement;
        let idRecipeRequirement;
        let idCardRequirement;

        try {
            craftRequirements = await InventoryQueries.getRecipeCraftRequirementsFromIdRecipe(idRecipe);

            craftRequirements.forEach(craft => {
                if (craft.idItemRequirement !== null) {
                    idItemRequirement = craft.idItemRequirement;
                }

                if(craft.idRecipeRequirement !== null) {
                    idRecipeRequirement = craft.idRecipeRequirement
                }

                if (craft.idPointRequirement !== null) {
                    idPointRequirement = craft.idPointRequirement;
                }

                if (craft.idGearRequirement !== null) {
                    idGearRequirement = craft.idGearRequirement;
                }

                if (craft.idCardRequirement !== null) {
                    idCardRequirement = craft.idCardRequirement;
                }
            });

        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeCraftRequirementsFromIdRecipe: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let itemRequirements;
        try {
            [itemRequirements] = await InventoryQueries.getItemRequirementsFromIdItemRequirement(idItemRequirement);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getItemRequirementsFromIdItemRequirement: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let gearRequirements;
        try {
            [gearRequirements] = await InventoryQueries.getGearRequirementsFromIdGearRequirement(idGearRequirement);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getGearRequirementsFromIdGearRequirement: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let pointRequirements;
        try {
            [pointRequirements] = await InventoryQueries.getPointsRequirementsFromIdPointsRequirement(idPointRequirement)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getPointsRequirementsFromIdPointsRequirement: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let recipeRequirements;
        try {
            [recipeRequirements] = await InventoryQueries.getRecipeRequirementsFromIdPointsRequirement(idRecipeRequirement)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeRequirementsFromIdPointsRequirement: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let cardRequirements;
        try {
            [cardRequirements] = await InventoryQueries.getCardRequirementsFromIdCardRequirement(idCardRequirement)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getCardRequirementsFromIdCardRequirement: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        // let userRequirements;
        // try {
        //     [ userRequirements ] = await InventoryQueries.getInstanceRequirementsFromAddressAndIdItem(address, itemRequirements.idItem);
        // } catch (error) {
        //     logger.error(`Error in InventoryQueries.getInstanceRequirementsFromAddressAndIdItem: ${Utils.printErrorLog(error)}`);
        //     throw error;
        // }

        let userPoints
        try {
            userPoints = await UserQueries.getResources(address);
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        userPoints=userPoints.pvpPoints
        let isPointAllowed
        if(pointRequirements){
            isPointAllowed = pointRequirements.pointRequired < userPoints
        }

        let userItem
        let isItemAllowed = false
        if (itemRequirements) {
            try {
                userItem = await ItemQueries.getItemQuantityByAddressAndIdItem(address, itemRequirements.idItem);
            } catch (error) {
                logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
                throw error;
            }
            if (userItem.quantity) {
                if (userItem.quantity >= pointRequirements.pointRequired) isItemAllowed = true
            }

        }

        return {
            id: recipe.idRecipe,
            name: recipe.name,
            image: recipe.image,
            description: recipe.description,
            category: recipe.category,
            product: {
                craftedName: craftedName,
                craftedImage: craftedImage,
                quantity: quantityCraft
            },

            menu: {
                craft: recipe.craft,
                view: recipe.view,
                send: recipe.view,
                sell: recipe.sell,
            },
            craft: {
                item: {
                    ...itemRequirements,
                    isAllowed: isItemAllowed
                },
                gear: {
                    ...gearRequirements
                },
                card: {
                    ...cardRequirements
                },
                points: {
                    ...pointRequirements,
                    isAllowed:isPointAllowed
                    
                },
                recipe:{
                    ...recipeRequirements
                }
            }
        }
    }

    static async getActiveWarService(address) {

        let activeWars = [];

        try {
            activeWars = await InventoryQueries.getActiveWarsFromAddress(address);

            if (activeWars.length === 0) {
                return {
                    success: false,
                    errorMessage: `You don't have active wars`,
                    status: 200,
                }
            }

        } catch (error) {
            logger.error(`Error in InventoryQueries.getActiveWarsFromAddress: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        logger.debug(`activeWars retrieved :${JSON.stringify(activeWars)}`)

        let activeWarsData = await Promise.all(
            activeWars.map(async war => {

                let enemyAddress = address !== war.address1 ? war.address1 : war.address2;

                let enemyData;

                try {
                    [enemyData] = await UserQueries.getUser(enemyAddress);
                } catch (error) {
                    logger.error(`Error in UserQueries.getUser: ${Utils.printErrorLog(error)}`);
                    throw error;
                }
                logger.debug(`Enemy data:${JSON.stringify(enemyData)}`);

                let battleData;

                try {
                    [ battleData ] = await BattleQueries.getTurnsInfoGivenAddressAndIdWar(war.idWar,address);
                } catch (error) {
                    logger.error(`Error in BattleQueries.getTurnsInfoGivenAddressAndIdWar: ${Utils.printErrorLog(error)}`);
                    throw error;
                }
                logger.debug(`battleData for idWar ${war.idWar}:${JSON.stringify(battleData)}`);
                let readyFlag
                if(battleData) readyFlag = true
                else readyFlag = false
                return {
                    idWar: war.idWar,
                    arena: war.idArena,
                    arena_name: war.name,
                    image: war.arena_image,
                    endingTime: war.endingTime,
                    rows: war.rangeNumber,
                    columns: war.numberColumns,
                    enemy: {
                        id: enemyData.idUser,
                        address: enemyData.address,
                        name: enemyData.name,
                        image: enemyData.image,
                        warPoints: enemyData.warPoints,
                    } || null,
                    ready:readyFlag
                }
            })
        )

        return {
            success: true,
            data: activeWarsData,
        }

    }

    static async getActiveWarInfoService(address, idWar) {

        let activeWar
        let response = {}


        try {
            activeWar = await BattleQueries.getActiveWarInfoFromAddressAndIdWar(address, idWar);
        } catch (error) {
            logger.error(`Error in BattleQueries.getActiveWarsFromAddress: ${Utils.printErrorLog(error)}`);
            throw error;
        }

        let affixIds
        try {
            affixIds = await BattleQueries.getAffixHistoryGivenIdWar(idWar);
        } catch (error) {
            logger.error(`Error in BattleQueries.getAffixHistoryGivenIdWar: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        if (affixIds.length != 1) {
            throw ("Error retrieving affixes!")
        }
        affixIds = affixIds[0]
        response.affixIdsTurn1 = affixIds.turn1.split(",")
        response.affixIdsTurn2 = affixIds.turn2.split(",")
        response.affixIdsTurn3 = affixIds.turn3.split(",")


        if (activeWar.length == 3) {
            for (let i = 0; i < 3; i++) {
                let bucket = activeWar[i]
                response["AffixesIdsTurn" + (i + 1)]
                response["turn" + (i + 1)] = JSON.parse(bucket.disposition)
                response["turn" + (i + 1) + "legendary"] = bucket.legendary
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                response["AffixesIdsTurn" + (i + 1)]
                response["turn" + (i + 1)] = null
                response["turn" + (i + 1) + "legendary"] = null
            }
        }


        return response

    }

    static async getRecipeGemInstanceData(idRecipe, address) {
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getGemRecipesInstance(address, idRecipe)
            console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries getGemRecipesInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw 'The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }
        let craftType , craftName,craftImage
        if(inventoryInstanceRawData[0].productName != null) {
            craftType = "gear"
            craftName = inventoryInstanceRawData[0].productName;
            craftImage = inventoryInstanceRawData[0].productImage
        }
        if(inventoryInstanceRawData[0].productName1 != null ){
            craftType = "item"
            craftName = inventoryInstanceRawData[0].productName1
            craftImage = inventoryInstanceRawData[0].productImage1
        }
        if(inventoryInstanceRawData[0].productName2 != null ){
            craftType = "card"
            craftName = inventoryInstanceRawData[0].productName2
            craftImage = inventoryInstanceRawData[0].productImage2
        } 
        if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName1 == null && inventoryInstanceRawData[0].productName2 == null) {
            console.log('**************** 2: ', inventoryInstanceRawData)
            throw 'The user hasn\'t got that inventory'
        }
        inventoryInstanceData.isAvailable = {
            craft: 1
        }
        let craftRequirements = []
        for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
            const row = inventoryInstanceRawData[i]
            craftRequirements.push(row)
        }

        let craftIsAllowed = true
        //let requirementsArray = []
        let idToolRequirement = {}
        let itemRequirements=[],cardRequirements=[],gearRequirements = [],recipeRequirements=[],pointRequirements=[]
        for (let requirement of craftRequirements) {
            if (requirement.idPointRequirement != null) {
                if (!(requirement.isPointAllowed )) {
                    craftIsAllowed = false
                }
                if (requirement.quantity != 0) {
                    pointRequirements.push({
                        name: 'pvpPoints',
                        image: serverConfig.PVPPOINTS_IMAGE,
                        quantity: requirement.quantity,
                        isAllowed: requirement.isPointAllowed
                    })
                }
            } else if (requirement.idItemRequirement != null) {
                if (!requirement.isItemAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredItemQuantity != 0) {
                    itemRequirements.push({
                        name: requirement.requiredItemName,
                        image: requirement.requiredItemImage,
                        quantity: requirement.requiredItemQuantity,
                        isAllowed: requirement.isItemAllowed
                    })
                }
            } else if (requirement.idGearRequirement != null && idGearRequirement[requirement.idGearRequirement] == undefined) {
                idGearRequirement[requirement.idGearRequirement] = true
                if (!requirement.isGearAllowed) {
                    craftIsAllowed = false
                }
                gearRequirements.push({
                    name: requirement.requiredGearName,
                    image: requirement.requiredGearImage,
                    quantity: 1,
                    level: requirement.requiredGearLevel,
                    burn: requirement.burn,
                    isAllowed: requirement.isGearAllowed
                })
            } else if (requirement.idCardRequirement != null && idCardRequirement[requirement.idCardRequirement] == undefined) {
                idCardRequirement[requirement.idCardRequirement] = true
                if (!requirement.idCardRequirement) {
                    craftIsAllowed = false
                }
                cardRequirements.push({
                    name: requirement.requiredCardName,
                    image: requirement.requiredCardImage,
                    quantity: 1,
                    level: requirement.requiredCardLevel,
                    burn: requirement.burn,
                    isAllowed: requirement.isCardAllowed
                })
            } else if (requirement.idRecipeRequirement != null) {
                if (!requirement.isRecipeAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredRecipeQuantity != 0) {
                    recipeRequirements.push({
                        name: requirement.requiredRecipeName,
                        image: requirement.requiredRecipeImage,
                        quantity: requirement.requiredRecipeQuantity,
                        isAllowed: requirement.isRecipeAllowed
                    })
                }
            }
        }
        //craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
        inventoryInstanceData.craft = {
            isAllowed: craftIsAllowed,
            probability: craftRequirements[0].chanceCraft,
            requirements: {
                itemRequirements:{
                    ...itemRequirements
                },
                cardRequirements:{
                    ...cardRequirements
                },
                gearRequirements:{
                    ...gearRequirements
                },
                recipeRequirements:{
                    ...recipeRequirements
                },
                pointRequirements:{
                    ...pointRequirements
                }
            },
            hasConsumables: false,
            consumables: [],
            product: {
                name: craftName,
                image: craftImage,
                quantity: (craftType == 'item' ? craftRequirements[0].productQuantity : 1 )
            }
        }

        // let craftConsumables
        // try {
        //     craftConsumables = await InventoryQueries.getRecipeConsumables(address)
        // } catch (error) {
        //     logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
        //     throw error
        // }
        // inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
        // for (var i = 0; i < craftConsumables.length; ++i) {
        //     inventoryInstanceData.craft.consumables.push({
        //         id: craftConsumables[i].idItemConsumable,
        //         name: craftConsumables[i].name,
        //         image: craftConsumables[i].image,
        //         description: craftConsumables[i].description,
        //         quantity: craftConsumables[i].quantity
        //     })
        // }

        let maxPossibleCraftCount
        try {
            maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount

        return inventoryInstanceData
    }

}

module.exports = { InventoryService }