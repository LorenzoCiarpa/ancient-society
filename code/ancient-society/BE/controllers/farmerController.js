//LOGGER
const logger = require("../logging/logger");

//VALIDATOR
const Validator = require('../utils/validator')

//BUILDING IMPORTS
const { BuildingService } = require(`../services/buildingService`);

//FISHERMAN IMPORTS
const { FarmerValidation } = require("../validations/farmerValidation")
const { FarmerQueries } = require(`../queries/farmerQueries`);
const { InventoryQueries } = require(`../queries/inventoryQueries`);
const { BuildingsQueries } = require(`../queries/buildingsQueries`);
const { FarmerService } = require("../services/farmerService");
const { FarmerInterface } = require("../interfaces/JS/farmerInterface");
const { InventoryService } = require("../services/inventory/inventoryService");
const { ToolService } = require('../services/inventory/toolService');

const { Utils } = require("../utils/utils");
const { PassiveService } = require("../services/passiveService");
const { PassiveQueries } = require("../queries/passiveQueries");
const { UserQueries } = require("../queries/userQueries");

const random = require("random");
const TYPE = 6;

// 1)aggiungere controllo che abbia un farmer stakato, che non sia in upgrade e che non stia pescando altrimenti tutti i mari hanno isAllowed = false.
// Aggiungere messageNotAllowed in ogni field specificando se: non stakato, in upgrade, pesca in corso, rarity non sufficiente.

// 2)nella response delle hoes, per la hoeEquipped dobbiamo vedere se esiste un record in farming con status == 1 e idToolInstance = hoeEquippedId e

// if il farminfEndingTime è nel futuro(sta ancora pescando) allora isFarming = true e farmingEndingTime = farming.farmingEndingTime

// else il farminfEndingTime è nel passato(ha finito) allora set staus = 2, farmingCompleteTime = farmingEndingTime e ritorniamo al FE isFarming = false
async function getFarmer(req, res) {
    logger.info(`getFarmer START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation
    validation = FarmerValidation.getFarmerValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let farmerResponse
    try {
        farmerResponse = await PassiveService.getFarmer(address)
    } catch (error) {
        logger.error(`Error in PassiveService.getFarmer: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info('getFarmer END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                farmerResponse
            }
        })
}

async function changeHoe(req, res) {
    logger.info(`changeHoe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation;
    validation = FarmerValidation.changeHoeValidator(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, userTool, idToolLevel, check, idTool, nftId, actualEquippedHoe, fields;

    try {
        userTool = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getFarmerFunction getTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (userTool.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that hoe'
                }
            })
    }

    idTool = userTool[0].idTool;
    idToolLevel = userTool[0].idToolLevel;

    try {
        response = await FarmerQueries.getQueryFarmer(address);
    } catch (error) {
        logger.error(`Error in FarmerQueries.getQueryFarmer: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryFarmer response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a farmer staked'
                }
            })
    }

    nftId = response[0].idBuilding;
    actualEquippedHoe = response[0].idToolInstance;

    if (actualEquippedHoe == idToolInstance) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Tool already equipped'
                }
            })
    }



    try {
        check = await InventoryService.verifyEquipable(address, nftId, TYPE, idTool);
    } catch (error) {
        logger.error(`
        Error in Inventory Service verifyEquipable: ${Utils.printErrorLog(error)}`
        );
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (!check) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have the requirements to equip the tool'
                }
            })
    }

    try {
        response = await InventoryService.setNewEquippedTool(nftId, TYPE, actualEquippedHoe, idToolInstance);
    } catch (error) {
        logger.error(`Error in Inventory Service verifyEquipable: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    try {
        response = await FarmerService.changeHoeBuilder(idToolInstance, address);
    } catch (error) {
        logger.error(`Error in FarmerService.changeHoeBuilder: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let result
    try {
        result = await FarmerService.getFieldsWithFarmerAllowance(address)
    } catch (error) {
        logger.error(`Error in FarmerService.getFieldsWithFarmerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    fields = result.fields

    let equippedHoeInstanceData
    try {
        equippedHoeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let toolIds = []
    toolIds.push(equippedHoeInstanceData.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        equippedHoeInstanceData.bonuses = toolBonuses[equippedHoeInstanceData.id] ? toolBonuses[equippedHoeInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    // data for passiveFarming
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFarmerPkBuildingFromAddress(address)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        pkBuilding = pkBuilding.id
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let passiveData
    try {
        passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let idPassiveFarmingSEEDItem
    try {
        idPassiveFarmingSEEDItem = await PassiveQueries.getPassiveConstant('idPassiveFarmingSEEDItem')
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let seedData
    try {
        seedData = await PassiveQueries.getItemInstanceData(address, idPassiveFarmingSEEDItem)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (seedData == undefined) {
        try {
            seedData = await PassiveQueries.getItemData(idPassiveFarmingSEEDItem)
        } catch (error) {
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        seedData.quantity = 0
    }

    // check the max number of consecutive farming actions (resource.ancien & hoe.durability & passiveData.storedActions)
    let ancienCostPerEachFarmingAction
    try {
        ancienCostPerEachFarmingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFarmingAction')
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let resources
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let ancien = resources.ancien

    let hoeDurability
    try {
        hoeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    hoeDurability = !hoeDurability ? 0 : hoeDurability

    let maxPerformableActions;

    if (passiveData == null || passiveData == undefined) maxPerformableActions = 0;
    else {
        maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(hoeDurability / 10))
    }

    logger.info(`changeHoe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                hoe: response,
                fields,
                equippedHoeInstanceData: equippedHoeInstanceData,
                passiveInfo: {
                    maxPerformableActions: maxPerformableActions
                }
            }
        });
}

async function burnPassiveSeed(req, res) {
    logger.info(`burnPassiveSeed START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = FarmerValidation.burnPassiveSeedValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let burnSeedCount = req.body.burnSeedCount

    // data for passiveFarming
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFarmerPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getFarmerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        pkBuilding = pkBuilding.id
    } catch (error) {
        logger.error(`User is forcing API`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    // update passive status
    try {
        await PassiveService.updatePassiveStatus1(pkBuilding, 6)
    } catch (error) {
        logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let response
    try {
        response = await FarmerService.burnPassiveSeed(address, pkBuilding, burnSeedCount)
    } catch (error) {
        logger.error(`Error in FarmerService.burnPassiveSeed: ${Utils.printErrorLog(error)}}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`burnPassiveSeed response: ${JSON.stringify(response)}`)
    logger.info("burnPassiveSeed END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function startPassiveFarming(req, res) {
    logger.info(`startPassiveFarming START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = FarmerValidation.passiveFarmValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idField = req.body.idField
    let consumableIds = req.body.consumableIds
    let actionNumber = req.body.actionNumber

    let farmer
    try {
        farmer = await FarmerQueries.verifyStakedFarmer(address);
    } catch (error) {
        logger.error(`Error in FarmerQueries.verifyStakedFarmer : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (farmer.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked farmer\'s hut that is not in upgrade'
                }
            })
    }

    let idFarmer = farmer[0].id
    let hoeIdToolLevel = farmer[0].idToolLevel
    let hoeIdTool = farmer[0].idTool
    let hoeIdInstance = farmer[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await FarmerQueries.checkUsingOfBuildingAndHoe(idFarmer, hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.checkUsingOfBuildingAndHoe : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (usingCheckRes.length != 0) {
        usingCheck = false
    }
    if (!usingCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Farming is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await FarmerService.checkRarityByHoeField(address, hoeIdInstance, idField)
    } catch (error) {
        logger.error(`Error in FarmerService.checkRarityByHoeField : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!rarityCheck.pass) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: rarityCheck.error
                }
            })
    }

    let enableCheck = true, enableCheckRes
    try {
        enableCheckRes = await FarmerQueries.checkByFieldTool(idField, hoeIdTool)
    } catch (error) {
        logger.error(`Error in FarmerQueries.checkByFieldTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(hoeIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to farm at the current field.'
                }
            })
    }

    // data for passiveFarming
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFarmerPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getFarmerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    pkBuilding = pkBuilding.id

    // update passive status
    try {
        await PassiveService.updatePassiveStatus1(pkBuilding, 6)
    } catch (error) {
        logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let allBonus
    try {
        allBonus = await FarmerQueries.getBonuses(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerService.farm : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);
    // check performable
    let passiveData
    try {
        passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
    } catch (error) {
        logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (passiveData == undefined || !passiveData.isPassive) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User didn\'t enable passive farming mode'
                }
            })
    }

    // check performable by actionNumber
    let ancienCostPerEachFarmingAction
    try {
        ancienCostPerEachFarmingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFarmingAction')
    } catch (error) {
        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let resources
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let ancien = resources.ancien

    let hoeDurability
    try {
        hoeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
    } catch (error) {
        logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    hoeDurability = !hoeDurability ? 0 : hoeDurability

    let maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(hoeDurability / 10))
    if (maxPerformableActions != actionNumber) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Performable action count is wrong.'
                }
            })
    }

    maxPerformableActions = 0

    let storedActions = passiveData.storedActions - actionNumber
    let burntActions = passiveData.burntActions - actionNumber
    let costAncien = ancienCostPerEachFarmingAction * actionNumber
    let result
    let totalFarmedItems = [], totalFarmedRecipes = [], totalFarmedFarms = [], totalFarmedExp = 0
    let lootForDurBonus = []

    let performActionNumber = actionNumber
    while (performActionNumber) {
        --performActionNumber

        let farmingRes
        try {
            farmingRes = await FarmerService.farm(address, idField, consumableIds, allBonus)
        } catch (error) {
            logger.error(`Error in FarmerService.farm : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.debug(`farmingRes:${JSON.stringify(farmingRes)}`)

        let farmedItems = farmingRes.items
        totalFarmedItems.push(...farmedItems)
        let farmedRecipes = farmingRes.recipes
        totalFarmedRecipes.push(...farmedRecipes)
        let farmedFarms = farmingRes.farms
        totalFarmedFarms.push(...farmedFarms)
        let farmedExp = farmingRes.experience
        totalFarmedExp += farmedExp
        let doubleLootDur = farmingRes.doubleLootDur
        lootForDurBonus.push(doubleLootDur)
    }


    // reduce hoeDurability
    try {
        result = await FarmerQueries.getDurability(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.getDurability : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.durability != -1) { //-1 Means Infinite Durability
        let subDurability = 10
        var totalActions = actionNumber //used to modify the total count for LOOT_FOR_DURABILITY

        let durBonus = allBonus.find(x => x['bonusCode'] === 'LESS_DURABILITY');
        if (durBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(durBonus)}`)
            subDurability = subDurability - durBonus.flatBoost
        }

        let nodurBonus = allBonus.find(x => x['bonusCode'] === 'NO_DURABILITY');
        if (nodurBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(nodurBonus)}`);
            for (let i = 0; i < actionNumber; i++) {
                if (random.int(0, 99) < nodurBonus.percentageBoost) {
                    totalActions--
                }
            }
        }

        let doubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleLootBonus)}`)
            for (let bool of lootForDurBonus) {
                if (bool) {
                    totalActions += 2
                }
            }
        }

        try {
            result = await FarmerQueries.reduceDurability(hoeIdInstance, subDurability * totalActions)
        } catch (error) {
            logger.error(`Error in FarmerQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        hoeDurability -= (subDurability * totalActions)  //properly return the durability for the bonuses
    }

    // reduce ancien cost for passiveFarming
    // try{
    //     await UserQueries.subResources(address, costAncien, 0, 0)
    // } catch (error){
    //     logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
    //     return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {
    //             errorMessage: error
    //         }
    //     })
    // }



    // update passive
    try {
        await PassiveQueries.calculateStoredActions(passiveData.idPassive, storedActions, null)
    } catch (error) {
        logger.error(`PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        await PassiveQueries.calculateBurntActions(passiveData.idPassive, burntActions)
    } catch (error) {
        logger.error(`PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let idPassiveFarming
    try {
        idPassiveFarming = await FarmerQueries.getIdPassiveFarming()
    } catch (error) {
        logger.error(`FarmerQueries.getIdPassiveFarming error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    //MOVED IT DOWN FOR THE FISHING HISTORY
    // try {
    //     result = await FarmerService.updatePassiveFarmingTable(address, idField, totalFarmedItems, totalFarmedRecipes, totalFarmedFarms, idFarmer, hoeIdToolLevel, hoeIdInstance, idPassiveFarming, actionNumber/*, quantityItem, quantityRecipe*/)
    // } catch (error) {
    //     logger.error(`Error in FarmerService.updatePassiveFarmingTable : ${Utils.printErrorLog(error)}`)
    //     return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {
    //             errorMessage: error
    //         }
    //     })
    // }

    //let response = { hasConsumables: false, consumables: [], drop: [], farmingEndingTime: result, hoeEndingTime: result }

    let response = { hasConsumables: false, consumables: [], drop: [] }

    let storage = {}
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    storage.ancien = resources.ancien
    storage.wood = resources.wood
    storage.stone = resources.stone
    response.storage = storage

    response.passiveInfo = {
        burntActions: burntActions,
        storedActions: storedActions,
        maxPerformableActions: maxPerformableActions,
    }
    response.hoe = { durability: hoeDurability }

    try {
        let farmedItems = [], farmedRecipes = [], farmedExp = totalFarmedExp
        let totalFarmedItemsObj = {}
        for (var i = 0; i < totalFarmedItems.length; ++i) {
            let item = totalFarmedItems[i]
            if (totalFarmedItemsObj[item.idItem] == undefined) {
                totalFarmedItemsObj[item.idItem] = {
                    type: 'item',
                    idItem: item.idItem,
                    image: item.image,
                    name: item.name,
                    rarity: item.rarity,
                    quantity: item.quantity
                }
            } else {
                totalFarmedItemsObj[item.idItem].quantity += item.quantity
            }
        }
        for (let idItem in totalFarmedItemsObj) {
            farmedItems.push(totalFarmedItemsObj[idItem])
            response.drop.push(totalFarmedItemsObj[idItem])
        }

        let totalFarmedRecipesObj = {}
        for (var i = 0; i < totalFarmedRecipes.length; ++i) {
            let recipe = totalFarmedRecipes[i]
            if (totalFarmedRecipesObj[recipe.idRecipe] == undefined) {
                totalFarmedRecipesObj[recipe.idRecipe] = {
                    type: 'recipe',
                    idRecipe: recipe.idRecipe,
                    image: recipe.image,
                    name: recipe.name,
                    rarity: recipe.rarity,
                    quantity: recipe.quantity
                }
            } else {
                totalFarmedRecipesObj[recipe.idRecipe].quantity += recipe.quantity
            }
        }
        for (let idRecipe in totalFarmedRecipesObj) {
            farmedRecipes.push(totalFarmedRecipesObj[idRecipe])
            response.drop.push(totalFarmedRecipesObj[idRecipe])
        }


        let totalFarmedFarmsObj = {}
        for (var i = 0; i < totalFarmedFarms.length; ++i) {
            let farm = totalFarmedFarms[i]
            if (totalFarmedFarmsObj[farm.idFieldFarm] == undefined) {
                totalFarmedFarmsObj[farm.idFieldFarm] = {
                    type: 'farm',
                    image: farm.image,
                    name: farm.name,
                    rarity: farm.rarity,
                    experience: farm.experience
                }
            } else {
                totalFarmedFarmsObj[farm.idFieldFarm].experience += farm.experience
            }
        }
        for (let idFieldFarm in totalFarmedFarmsObj) {
            response.drop.push(totalFarmedFarmsObj[idFieldFarm])
        }

        let result;
        let quantityItem = {};
        let quantityRecipe = {};
        try {
            quantityItem = await FarmerService.addFarmedItemsToAddress(address, totalFarmedItems)
        } catch (error) {
            logger.error(`Error in FarmerService.addFarmedItemsToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        try {
            quantityRecipe = await FarmerService.addFarmedRecipesToAddress(address, totalFarmedRecipes)
        } catch (error) {
            logger.error(`Error in FarmerService.addFarmedRecipesToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }


        let cdBonus = allBonus.find(vendor => vendor['bonusCode'] === 'NO_CD');
        if (cdBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(cdBonus)}`)
            if (random.int(0, 99) < cdBonus.percentageBoost) {
                passiveData.actionCoolDown = 0
            }
        }

        try {
            result = await FarmerService.updatePassiveFarmingTable(
                address,
                idField,
                totalFarmedItems,
                totalFarmedRecipes,
                totalFarmedFarms,
                idFarmer,
                hoeIdToolLevel,
                hoeIdInstance,
                idPassiveFarming,
                actionNumber,
                quantityItem,
                quantityRecipe,
                passiveData.actionCoolDown)
        } catch (error) {
            logger.error(`Error in FarmerService.updatePassiveFarmingTable : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        response.farmingEndingTime = result;
        response.hoeEndingTime = result;

        try {
            result = await FarmerService.addExpToAddress(address, farmedExp)
        } catch (error) {
            logger.error(`Error in FarmerService.addExpToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    } catch (error) {
        logger.error(`Error in building response : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    try {
        result = await FarmerService.getFieldsWithFarmerAllowance(address)
    } catch (error) {
        logger.error(`Error in FarmerService.getFieldsWithFarmerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.fields = result.fields

    try {
        result = await InventoryService.getInventoryInstanceData(address, hoeIdInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let toolIds = []
    toolIds.push(result.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        result.bonuses = toolBonuses[result.id] ? toolBonuses[result.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    response.equippedHoeInstanceData = result

    logger.debug(`startPassiveFarming response:${JSON.stringify(response)}`)
    logger.info(`startPassiveFarming END`)
    return res
        .status(200)
        .json({
            success: true,
            data: response
        });
}

async function startFarming(req, res) {
    logger.info(`startFarming START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = FarmerValidation.farmValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idField = req.body.idField
    let consumableIds = req.body.consumableIds
    let checkConsumables;

    let farmer
    try {
        farmer = await FarmerQueries.verifyStakedFarmer(address);
    } catch (error) {
        logger.error(`Error in FarmerQueries.verifyStakedFarmer : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (farmer.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked farmer\'s hut that is not in upgrade'
                }
            })
    }

    let idFarmer = farmer[0].id
    let hoeIdToolLevel = farmer[0].idToolLevel
    let hoeIdTool = farmer[0].idTool
    let hoeIdInstance = farmer[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await FarmerQueries.checkUsingOfBuildingAndHoe(idFarmer, hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.checkUsingOfBuildingAndHoe : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (usingCheckRes.length != 0) {
        usingCheck = false
    }
    if (!usingCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Farming is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await FarmerService.checkRarityByHoeField(address, hoeIdInstance, idField)
    } catch (error) {
        logger.error(`Error in FarmerService.checkRarityByHoeField : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!rarityCheck.pass) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: rarityCheck.error
                }
            })
    }

    let enableCheck = true, enableCheckRes
    try {
        enableCheckRes = await FarmerQueries.checkByFieldTool(idField, hoeIdTool)
    } catch (error) {
        logger.error(`Error in FarmerQueries.checkByFieldTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(hoeIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to farm at the current field.'
                }
            })
    }

    let durabilityCheck
    try {
        durabilityCheck = await FarmerService.checkDurabilityByIdHoeInstance(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerService.checkDurabilityByIdHoeInstance : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!durabilityCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You need Hoe\'s durability more than 10 to farm.'
                }
            })
    }

    let checkPassive;
    try {
        checkPassive = await FarmerQueries.getPassiveStatus(idFarmer)
    } catch (error) {
        logger.error(`Error in FarmerQueries.getPassiveStatus : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (checkPassive?.length > 0 && checkPassive[0]?.isPassive == 1) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Your farmer is in passive status'
                }
            })
    }

    let allBonus
    try {
        allBonus = await FarmerQueries.getBonuses(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerService.farm : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);


    let farmingRes
    try {
        farmingRes = await FarmerService.farm(address, idField, consumableIds, allBonus)
    } catch (error) {
        logger.error(`Error in FarmerService.farm : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`farmingRes:${JSON.stringify(farmingRes)}`)

    let farmedItems = farmingRes.items
    let farmedRecipes = farmingRes.recipes
    let farmedFarms = farmingRes.farms
    let farmedExp = farmingRes.experience

    let quantityFarm = farmedFarms.length

    let result, quantityItem, quantityRecipe
    try {
        quantityItem = await FarmerService.addFarmedItemsToAddress(address, farmedItems)
    } catch (error) {
        logger.error(`Error in FarmerService.addFarmedItemsToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        quantityRecipe = await FarmerService.addFarmedRecipesToAddress(address, farmedRecipes)
    } catch (error) {
        logger.error(`Error in FarmerService.addFarmedRecipesToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FarmerService.addExpToAddress(address, farmedExp)
    } catch (error) {
        logger.error(`Error in FarmerService.addExpToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FarmerQueries.getDurability(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.getDurability : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.durability != -1) { //-1 Means Infinite Durability
        let subDurability = 10

        let durBonus = allBonus.find(vendor => vendor['bonusCode'] === 'LESS_DURABILITY');
        if (durBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(durBonus)}`)
            subDurability = subDurability - durBonus.flatBoost
        }

        let nodurBonus = allBonus.find(vendor => vendor['bonusCode'] === 'NO_DURABILITY');
        if (nodurBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(nodurBonus)}`);
            if (random.int(0, 99) < nodurBonus.percentageBoost) {
                subDurability = 0
            }
        }
        let doubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleLootBonus)}`)
            if (farmingRes.doubleLootDur) {
                subDurability = 3 * subDurability
            }
        }

        try {
            result = await FarmerQueries.reduceDurability(hoeIdInstance, subDurability)
        } catch (error) {
            logger.error(`Error in FarmerQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
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

    let reduceCoolDown = false, noCoolDown = false
    if (consumableIds[0] == 74 || consumableIds[1] == 74 || consumableIds[2] == 74) {
        reduceCoolDown = true
        let seedBonus = allBonus.find(x => x['bonusCode'] === 'SEED_CD');
        if (seedBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(seedBonus)}`)
            if (random.int(0, 99) < seedBonus.percentageBoost) {
                noCoolDown = true
            }
        }
    }

    let cdBonus = allBonus.find(x => x['bonusCode'] === 'NO_CD');
    if (cdBonus != undefined) {
        logger.debug(`bonus found ${JSON.stringify(cdBonus)}`)
        if (random.int(0, 99) < cdBonus.percentageBoost) {
            noCoolDown = true
        }
    }

    try {

        result = await FarmerService.updateFarmingTable(address, idField, farmedItems, farmedRecipes, farmedFarms, idFarmer, hoeIdToolLevel, hoeIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityFarm)
    } catch (error) {
        logger.error(`Error in FarmerService.updateFarmingTable : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let response = { hasConsumables: false, consumables: [], drop: [], farmingEndingTime: result, hoeEndingTime: result }

    let consumables
    try {
        consumables = await InventoryQueries.getFarmConsumables(address)
    } catch (error) {
        logger.error(`InventoryQueries.getFarmConsumables error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    response.hasConsumables = consumables.length == 0 ? false : true
    for (var i = 0; i < consumables.length; ++i) {
        response.consumables.push({
            id: consumables[i].idItemConsumable,
            name: consumables[i].name,
            image: consumables[i].image,
            description: consumables[i].description,
            quantity: consumables[i].quantity
        })
    }

    try {
        result = await FarmerQueries.getDurabilityByIdToolInstance(hoeIdInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.getDurabilityByIdToolInstance : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that hoe.'
                }
            })
    }
    response.hoe = { durability: result[0].durability }
    try {
        for (var i = 0; i < farmedItems.length; ++i) {
            response.drop.push({
                type: 'item',
                image: farmedItems[i].image,
                name: farmedItems[i].name,
                rarity: farmedItems[i].rarity,
                quantity: farmedItems[i].quantity
            })
        }

        for (var i = 0; i < farmedRecipes.length; ++i) {
            response.drop.push({
                type: 'recipe',
                image: farmedRecipes[i].image,
                name: farmedRecipes[i].name,
                rarity: farmedRecipes[i].rarity,
                quantity: farmedRecipes[i].quantity
            })
        }

        for (let farm of farmedFarms) {
            response.drop.push({
                type: 'farm',
                image: farm.image,
                name: farm.name,
                rarity: farm.rarity,
                experience: farm.experience
            })
        }

    } catch (error) {
        logger.error(`Error in building response : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    try {
        result = await FarmerService.getFieldsWithFarmerAllowance(address)
    } catch (error) {
        logger.error(`Error in FarmerService.getFieldsWithFarmerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.fields = result.fields

    try {
        result = await InventoryService.getInventoryInstanceData(address, hoeIdInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let toolIds = []
    toolIds.push(result.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        result.bonuses = toolBonuses[result.id] ? toolBonuses[result.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    response.equippedHoeInstanceData = result

    logger.debug(`startFarming response:${JSON.stringify(response)}`)
    logger.info(`startFarming END`)
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function unEquipHoe(req, res) {
    logger.info(`unEquipHoe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = FarmerValidation.unEquipHoeValidator(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, actualEquippedHoe, fields;

    try {
        response = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getFarmerFunction getTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (response.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that hoe'
                }
            })
    } else if (response[0].equipped == false) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not equipped tool'
                }
            })
    }

    try {
        response = await FarmerQueries.getQueryFarmer(address);
    } catch (error) {
        logger.error(`Error in FarmerQueries.getQueryFarmer: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryFarmer response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a farmer staked'
                }
            })
    }

    let buildingId = response[0].id
    actualEquippedHoe = response[0].idToolInstance;

    if (actualEquippedHoe != idToolInstance) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not equipped tool.'
                }
            })
    }

    try {
        response = await FarmerQueries.unEquipHoe(buildingId)
    } catch (error) {
        logger.error(`Error in FarmerQueries.unEquipHoe: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    try {
        response = await FarmerQueries.unEquipTool(idToolInstance)
    } catch (error) {
        logger.error(`Error in FarmerQueries.unEquipTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let result
    try {
        result = await FarmerService.getFieldsWithFarmerAllowance(address);
    } catch (error) {
        logger.error(`Error in FarmerService.getFieldsWithFarmerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    fields = result.fields

    logger.info(`unEquipHoe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                fields
            }
        });
}

async function upgradeHoe(req, res) {

    logger.info(`upgradeHoe START`);

    let validation = FarmerValidation.upgradeHoeValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let response
    let address = req.locals.address
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    try {
        response = await ToolService.upgrade(address, idToolInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in ToolService.upgrade: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let fields, equippedHoeInstanceData
    let result
    try {
        result = await FarmerService.getFieldsWithFarmerAllowance(address)
    } catch (error) {
        logger.error(`Error in FarmerService.getFieldsWithFarmerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    fields = result.fields

    try {
        equippedHoeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`upgradeHoe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                fields,
                status: response,
                equippedHoeInstanceData
            }
        });
}

async function repairHoe(req, res) {

    logger.info(`repairHoe START`);

    let validation = FarmerValidation.repairHoeValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let response
    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    try {
        response = await ToolService.repair(address, idToolInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in ToolService.upgrade: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let equippedHoeInstanceData

    try {
        equippedHoeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`repairHoe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                status: response,
                equippedHoeInstanceData
            }
        });
}

module.exports = {
    getFarmer,
    changeHoe,
    startFarming,
    unEquipHoe,
    repairHoe,
    upgradeHoe,
    burnPassiveSeed,
    startPassiveFarming
}
