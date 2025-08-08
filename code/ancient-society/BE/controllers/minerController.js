//LOGGER
const logger = require("../logging/logger");

//VALIDATOR
const Validator = require('../utils/validator')

//BUILDING IMPORTS
const { BuildingService } = require(`../services/buildingService`);

//FISHERMAN IMPORTS
const { MinerValidation } = require("../validations/minerValidation")
const { MinerQueries } = require(`../queries/minerQueries`);
const { InventoryQueries } = require(`../queries/inventoryQueries`);
const { BuildingsQueries } = require(`../queries/buildingsQueries`);
const { MinerService } = require("../services/minerService");
const { MinerInterface } = require("../interfaces/JS/minerInterface");
const { InventoryService } = require("../services/inventory/inventoryService");
const { ToolService } = require('../services/inventory/toolService');

const { Utils } = require("../utils/utils");
const { PassiveService } = require("../services/passiveService");
const { PassiveQueries } = require("../queries/passiveQueries");
const { UserQueries } = require("../queries/userQueries");

const random = require("random");
const TYPE = 5;

// 1)aggiungere controllo che abbia un miner stakato, che non sia in upgrade e che non stia pescando altrimenti tutti i mari hanno isAllowed = false.
// Aggiungere messageNotAllowed in ogni cave specificando se: non stakato, in upgrade, pesca in corso, rarity non sufficiente.

// 2)nella response delle axes, per la axeEquipped dobbiamo vedere se esiste un record in mining con status == 1 e idToolInstance = axeEquippedId e

// if il mineinfEndingTime è nel futuro(sta ancora pescando) allora isMining = true e miningEndingTime = mining.miningEndingTime

// else il mineinfEndingTime è nel passato(ha finito) allora set staus = 2, miningCompleteTime = miningEndingTime e ritorniamo al FE isMining = false
async function getMiner(req, res) {
    logger.info(`getMiner START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation
    validation = MinerValidation.getMinerValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let minerResponse
    try {
        minerResponse = await PassiveService.getMiner(address)
    } catch (error) {
        logger.error(`Error in PassiveService.getMiner: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info('getMiner END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                minerResponse
            }
        })
}

async function changeAxe(req, res) {
    logger.info(`changeAxe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation;
    validation = MinerValidation.changeAxeValidator(req);
    if (!validation.success) {
        logger.error(`Error in MinerValidation.changeAxeValidator: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, userTool, idToolLevel, check, idTool, nftId, actualEquippedAxe, caves;

    try {
        userTool = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getMinerFunction getTool: ${Utils.printErrorLog(error)}`);
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
        logger.error(`You have not that axe`);

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that axe'
                }
            })
    }

    idTool = userTool[0].idTool;
    idToolLevel = userTool[0].idToolLevel;

    try {
        response = await MinerQueries.getQueryMiner(address);
    } catch (error) {
        logger.error(`Error in MinerQueries.getQueryMiner: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryMiner response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        logger.error(`User doesn't have a miner staked`);

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a miner staked'
                }
            })
    }

    nftId = response[0].idBuilding;
    actualEquippedAxe = response[0].idToolInstance;

    if (actualEquippedAxe == idToolInstance) {
        logger.error(`Tool already equipped`);

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
        response = await InventoryService.setNewEquippedTool(nftId, TYPE, actualEquippedAxe, idToolInstance);
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
        response = await MinerService.changeAxeBuilder(idToolInstance, address);
    } catch (error) {
        logger.error(`Error in MinerService.changeAxeBuilder: ${Utils.printErrorLog(error)}`);
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
        result = await MinerService.getCavesWithMinerAllowance(address)
    } catch (error) {
        logger.error(`Error in MinerService.getCavesWithMinerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    caves = result.caves

    let equippedAxeInstanceData
    try {
        equippedAxeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
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
    toolIds.push(equippedAxeInstanceData.id)
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

        equippedAxeInstanceData.bonuses = toolBonuses[equippedAxeInstanceData.id] ? toolBonuses[equippedAxeInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    // data for passiveMining
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getMinerPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`Error in PassiveQueries.getMinerPkBuildingFromAddress: ${Utils.printErrorLog(error)}`);

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
        logger.error(`pkbuilding is undefined`);

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
        logger.error(`Error in PassiveQueries.getPassiveDataFromPkBuilding: ${Utils.printErrorLog(error)}`);

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let idPassiveMiningTNTItem
    try {
        idPassiveMiningTNTItem = await PassiveQueries.getPassiveConstant('idPassiveMiningTNTItem')
    } catch (error) {
        logger.error(`Error in PassiveQueries.getPassiveConstant: ${Utils.printErrorLog(error)}`);

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let tntData
    try {
        tntData = await PassiveQueries.getItemInstanceData(address, idPassiveMiningTNTItem)
    } catch (error) {
        logger.error(`Error in PassiveQueries.getItemInstanceData: ${Utils.printErrorLog(error)}`);

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (tntData == undefined) {
        try {
            tntData = await PassiveQueries.getItemData(idPassiveMiningTNTItem)
        } catch (error) {
        logger.error(`Error in PassiveQueries.getItemData: ${Utils.printErrorLog(error)}`);

            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        tntData.quantity = 0
    }

    // check the max number of consecutive mining actions (resource.ancien & axe.durability & passiveData.storedActions)
    let ancienCostPerEachMiningAction
    try {
        ancienCostPerEachMiningAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachMiningAction')
    } catch (error) {
        logger.error(`Error in PassiveQueries.getPassiveConstant: ${Utils.printErrorLog(error)}`);

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
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);

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

    let axeDurability
    try {
        axeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
    } catch (error) {
        logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`);
        
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    axeDurability = !axeDurability ? 0 : axeDurability

    let maxPerformableActions;

    if (passiveData == null || passiveData == undefined) maxPerformableActions = 0;
    else {
        maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(axeDurability / 10))
    }

    logger.info(`changeAxe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                axe: response,
                caves,
                equippedAxeInstanceData: equippedAxeInstanceData,
                passiveInfo: {
                    maxPerformableActions: maxPerformableActions
                }
            }
        });
}

async function burnPassiveTNT(req, res) {
    logger.info(`burnPassiveTNT START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = MinerValidation.burnPassiveTNTValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let burnTNTCount = req.body.burnTNTCount

    // data for passiveMining
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getMinerPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getMinerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
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
        await PassiveService.updatePassiveStatus1(pkBuilding, 5)
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
        response = await MinerService.burnPassiveTNT(address, pkBuilding, burnTNTCount)
    } catch (error) {
        logger.error(`Error in MinerService.burnPassiveTNT: ${Utils.printErrorLog(error)}}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`burnPassiveTNT response: ${JSON.stringify(response)}`)
    logger.info("burnPassiveTNT END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function startPassiveMining(req, res) {
    logger.info(`startPassiveMining START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = MinerValidation.passiveMineValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idCave = req.body.idCave
    let consumableIds = req.body.consumableIds
    let actionNumber = req.body.actionNumber

    let miner
    try {
        miner = await MinerQueries.verifyStakedMiner(address);
    } catch (error) {
        logger.error(`Error in MinerQueries.verifyStakedMiner : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (miner.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked miner\'s hut that is not in upgrade'
                }
            })
    }

    let idMiner = miner[0].id
    let axeIdToolLevel = miner[0].idToolLevel
    let axeIdTool = miner[0].idTool
    let axeIdInstance = miner[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await MinerQueries.checkUsingOfBuildingAndAxe(idMiner, axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.checkUsingOfBuildingAndAxe : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'Mining is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await MinerService.checkRarityByAxeCave(address, axeIdInstance, idCave)
    } catch (error) {
        logger.error(`Error in MinerService.checkRarityByAxeCave : ${Utils.printErrorLog(error)}`)
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
        enableCheckRes = await MinerQueries.checkByCaveTool(idCave, axeIdTool)
    } catch (error) {
        logger.error(`Error in MinerQueries.checkByCaveTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(axeIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to mine at the current cave.'
                }
            })
    }

    // data for passiveMining
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getMinerPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getMinerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
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
        await PassiveService.updatePassiveStatus1(pkBuilding, 5)
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
        allBonus = await MinerQueries.getBonuses(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerService.mine : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'User didn\'t enable passive mining mode'
                }
            })
    }

    // check performable by actionNumber
    let ancienCostPerEachMiningAction
    try {
        ancienCostPerEachMiningAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachMiningAction')
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

    let axeDurability
    try {
        axeDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
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
    axeDurability = !axeDurability ? 0 : axeDurability

    let maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(axeDurability / 10))
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
    let costAncien = ancienCostPerEachMiningAction * actionNumber
    let result
    let totalMinedItems = [], totalMinedRecipes = [], totalMinedMines = [], totalMinedExp = 0
    let lootForDurBonus = []

    let performActionNumber = actionNumber
    while (performActionNumber) {
        --performActionNumber

        let miningRes
        try {
            miningRes = await MinerService.mine(address, idCave, consumableIds, allBonus)
        } catch (error) {
            logger.error(`Error in MinerService.mine : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.debug(`miningRes:${JSON.stringify(miningRes)}`)

        let minedItems = miningRes.items
        totalMinedItems.push(...minedItems)
        let minedRecipes = miningRes.recipes
        totalMinedRecipes.push(...minedRecipes)
        let minedMines = miningRes.mines
        totalMinedMines.push(...minedMines)
        let minedExp = miningRes.experience
        totalMinedExp += minedExp
        let doubleLootDur = miningRes.doubleLootDur
        lootForDurBonus.push(doubleLootDur)
    }


    // reduce axeDurability
    try {
        result = await MinerQueries.getDurability(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.getDurability : ${Utils.printErrorLog(error)}`)
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
            result = await MinerQueries.reduceDurability(axeIdInstance, subDurability * totalActions)
        } catch (error) {
            logger.error(`Error in MinerQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        axeDurability -= (subDurability * totalActions)  //properly return the durability for the bonuses
    }

    // reduce ancien cost for passiveMining
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

    let idPassiveMining
    try {
        idPassiveMining = await MinerQueries.getIdPassiveMining()
    } catch (error) {
        logger.error(`MinerQueries.getIdPassiveMining error : ${Utils.printErrorLog(error)}`)
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
    //     result = await MinerService.updatePassiveMiningTable(address, idCave, totalMinedItems, totalMinedRecipes, totalMinedMines, idMiner, axeIdToolLevel, axeIdInstance, idPassiveMining, actionNumber/*, quantityItem, quantityRecipe*/)
    // } catch (error) {
    //     logger.error(`Error in MinerService.updatePassiveMiningTable : ${Utils.printErrorLog(error)}`)
    //     return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {
    //             errorMessage: error
    //         }
    //     })
    // }

    //let response = { hasConsumables: false, consumables: [], drop: [], miningEndingTime: result, axeEndingTime: result }

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
    response.axe = { durability: axeDurability }

    try {
        let minedItems = [], minedRecipes = [], minedExp = totalMinedExp
        let totalMinedItemsObj = {}
        for (var i = 0; i < totalMinedItems.length; ++i) {
            let item = totalMinedItems[i]
            if (totalMinedItemsObj[item.idItem] == undefined) {
                totalMinedItemsObj[item.idItem] = {
                    type: 'item',
                    idItem: item.idItem,
                    image: item.image,
                    name: item.name,
                    rarity: item.rarity,
                    quantity: item.quantity
                }
            } else {
                totalMinedItemsObj[item.idItem].quantity += item.quantity
            }
        }
        for (let idItem in totalMinedItemsObj) {
            minedItems.push(totalMinedItemsObj[idItem])
            response.drop.push(totalMinedItemsObj[idItem])
        }

        let totalMinedRecipesObj = {}
        for (var i = 0; i < totalMinedRecipes.length; ++i) {
            let recipe = totalMinedRecipes[i]
            if (totalMinedRecipesObj[recipe.idRecipe] == undefined) {
                totalMinedRecipesObj[recipe.idRecipe] = {
                    type: 'recipe',
                    idRecipe: recipe.idRecipe,
                    image: recipe.image,
                    name: recipe.name,
                    rarity: recipe.rarity,
                    quantity: recipe.quantity
                }
            } else {
                totalMinedRecipesObj[recipe.idRecipe].quantity += recipe.quantity
            }
        }
        for (let idRecipe in totalMinedRecipesObj) {
            minedRecipes.push(totalMinedRecipesObj[idRecipe])
            response.drop.push(totalMinedRecipesObj[idRecipe])
        }


        let totalMinedMinesObj = {}
        for (var i = 0; i < totalMinedMines.length; ++i) {
            let mine = totalMinedMines[i]
            if (totalMinedMinesObj[mine.idCaveMine] == undefined) {
                totalMinedMinesObj[mine.idCaveMine] = {
                    type: 'mine',
                    image: mine.image,
                    name: mine.name,
                    rarity: mine.rarity,
                    experience: mine.experience
                }
            } else {
                totalMinedMinesObj[mine.idCaveMine].experience += mine.experience
            }
        }
        for (let idCaveMine in totalMinedMinesObj) {
            response.drop.push(totalMinedMinesObj[idCaveMine])
        }

        let result;
        let quantityItem = {};
        let quantityRecipe = {};
        try {
            quantityItem = await MinerService.addMinedItemsToAddress(address, totalMinedItems)
        } catch (error) {
            logger.error(`Error in MinerService.addMinedItemsToAddress : ${Utils.printErrorLog(error)}`)
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
            quantityRecipe = await MinerService.addMinedRecipesToAddress(address, totalMinedRecipes)
        } catch (error) {
            logger.error(`Error in MinerService.addMinedRecipesToAddress : ${Utils.printErrorLog(error)}`)
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
            result = await MinerService.updatePassiveMiningTable(
                address,
                idCave,
                totalMinedItems,
                totalMinedRecipes,
                totalMinedMines,
                idMiner,
                axeIdToolLevel,
                axeIdInstance,
                idPassiveMining,
                actionNumber,
                quantityItem,
                quantityRecipe,
                passiveData.actionCoolDown)
        } catch (error) {
            logger.error(`Error in MinerService.updatePassiveMiningTable : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        response.miningEndingTime = result;
        response.axeEndingTime = result;

        try {
            result = await MinerService.addExpToAddress(address, minedExp)
        } catch (error) {
            logger.error(`Error in MinerService.addExpToAddress : ${Utils.printErrorLog(error)}`)
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
        result = await MinerService.getCavesWithMinerAllowance(address)
    } catch (error) {
        logger.error(`Error in MinerService.getCavesWithMinerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.caves = result.caves

    try {
        result = await InventoryService.getInventoryInstanceData(address, axeIdInstance, 'tool')
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

    response.equippedAxeInstanceData = result

    logger.debug(`startPassiveMining response:${JSON.stringify(response)}`)
    logger.info(`startPassiveMining END`)
    return res
        .status(200)
        .json({
            success: true,
            data: response
        });
}

async function startMining(req, res) {
    logger.info(`startMining START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = MinerValidation.mineValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idCave = req.body.idCave
    let consumableIds = req.body.consumableIds
    let checkConsumables;

    let miner
    try {
        miner = await MinerQueries.verifyStakedMiner(address);
    } catch (error) {
        logger.error(`Error in MinerQueries.verifyStakedMiner : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (miner.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked miner\'s hut that is not in upgrade'
                }
            })
    }

    let idMiner = miner[0].id
    let axeIdToolLevel = miner[0].idToolLevel
    let axeIdTool = miner[0].idTool
    let axeIdInstance = miner[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await MinerQueries.checkUsingOfBuildingAndAxe(idMiner, axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.checkUsingOfBuildingAndAxe : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'Mining is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await MinerService.checkRarityByAxeCave(address, axeIdInstance, idCave)
    } catch (error) {
        logger.error(`Error in MinerService.checkRarityByAxeCave : ${Utils.printErrorLog(error)}`)
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
        enableCheckRes = await MinerQueries.checkByCaveTool(idCave, axeIdTool)
    } catch (error) {
        logger.error(`Error in MinerQueries.checkByCaveTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(axeIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to mine at the current cave.'
                }
            })
    }

    let durabilityCheck
    try {
        durabilityCheck = await MinerService.checkDurabilityByIdAxeInstance(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerService.checkDurabilityByIdAxeInstance : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'You need Axe\'s durability more than 10 to mine.'
                }
            })
    }

    let checkPassive;
    try {
        checkPassive = await MinerQueries.getPassiveStatus(idMiner)
    } catch (error) {
        logger.error(`Error in MinerQueries.getPassiveStatus : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'Your miner is in passive status'
                }
            })
    }

    let allBonus
    try {
        allBonus = await MinerQueries.getBonuses(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerService.mine : ${Utils.printErrorLog(error)}`)
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


    let miningRes
    try {
        miningRes = await MinerService.mine(address, idCave, consumableIds, allBonus)
    } catch (error) {
        logger.error(`Error in MinerService.mine : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`miningRes:${JSON.stringify(miningRes)}`)

    let minedItems = miningRes.items
    let minedRecipes = miningRes.recipes
    let minedMines = miningRes.mines
    let minedExp = miningRes.experience

    let quantityMine = minedMines.length

    let result, quantityItem, quantityRecipe
    try {
        quantityItem = await MinerService.addMinedItemsToAddress(address, minedItems)
    } catch (error) {
        logger.error(`Error in MinerService.addMinedItemsToAddress : ${Utils.printErrorLog(error)}`)
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
        quantityRecipe = await MinerService.addMinedRecipesToAddress(address, minedRecipes)
    } catch (error) {
        logger.error(`Error in MinerService.addMinedRecipesToAddress : ${Utils.printErrorLog(error)}`)
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
        result = await MinerService.addExpToAddress(address, minedExp)
    } catch (error) {
        logger.error(`Error in MinerService.addExpToAddress : ${Utils.printErrorLog(error)}`)
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
        result = await MinerQueries.getDurability(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.getDurability : ${Utils.printErrorLog(error)}`)
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
            if (miningRes.doubleLootDur) {
                subDurability = 3 * subDurability
            }
        }

        try {
            result = await MinerQueries.reduceDurability(axeIdInstance, subDurability)
        } catch (error) {
            logger.error(`Error in MinerQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
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
    if (consumableIds[0] == 71 || consumableIds[1] == 71 || consumableIds[2] == 71) {
        reduceCoolDown = true
        let tntBonus = allBonus.find(x => x['bonusCode'] === 'TNT_CD');
        if (tntBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(tntBonus)}`)
            if (random.int(0, 99) < tntBonus.percentageBoost) {
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

        result = await MinerService.updateMiningTable(address, idCave, minedItems, minedRecipes, minedMines, idMiner, axeIdToolLevel, axeIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityMine)
    } catch (error) {
        logger.error(`Error in MinerService.updateMiningTable : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let response = { hasConsumables: false, consumables: [], drop: [], miningEndingTime: result, axeEndingTime: result }

    let consumables
    try {
        consumables = await InventoryQueries.getMineConsumables(address)
    } catch (error) {
        logger.error(`InventoryQueries.getMineConsumables error : ${Utils.printErrorLog(error)}`)
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
        result = await MinerQueries.getDurabilityByIdToolInstance(axeIdInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.getDurabilityByIdToolInstance : ${Utils.printErrorLog(error)}`)
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
                    errorMessage: 'You haven\'t got that axe.'
                }
            })
    }
    response.axe = { durability: result[0].durability }
    try {
        for (var i = 0; i < minedItems.length; ++i) {
            response.drop.push({
                type: 'item',
                image: minedItems[i].image,
                name: minedItems[i].name,
                rarity: minedItems[i].rarity,
                quantity: minedItems[i].quantity
            })
        }

        for (var i = 0; i < minedRecipes.length; ++i) {
            response.drop.push({
                type: 'recipe',
                image: minedRecipes[i].image,
                name: minedRecipes[i].name,
                rarity: minedRecipes[i].rarity,
                quantity: minedRecipes[i].quantity
            })
        }

        for (let mine of minedMines) {
            response.drop.push({
                type: 'mine',
                image: mine.image,
                name: mine.name,
                rarity: mine.rarity,
                experience: mine.experience
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
        result = await MinerService.getCavesWithMinerAllowance(address)
    } catch (error) {
        logger.error(`Error in MinerService.getCavesWithMinerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.caves = result.caves

    try {
        result = await InventoryService.getInventoryInstanceData(address, axeIdInstance, 'tool')
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

    response.equippedAxeInstanceData = result

    logger.debug(`startMining response:${JSON.stringify(response)}`)
    logger.info(`startMining END`)
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function unEquipAxe(req, res) {
    logger.info(`unEquipAxe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = MinerValidation.unEquipAxeValidator(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, actualEquippedAxe, caves;

    try {
        response = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getMinerFunction getTool: ${Utils.printErrorLog(error)}`);
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
                    errorMessage: 'You haven\'t got that axe'
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
        response = await MinerQueries.getQueryMiner(address);
    } catch (error) {
        logger.error(`Error in MinerQueries.getQueryMiner: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryMiner response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a miner staked'
                }
            })
    }

    let buildingId = response[0].id
    actualEquippedAxe = response[0].idToolInstance;

    if (actualEquippedAxe != idToolInstance) {
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
        response = await MinerQueries.unEquipAxe(buildingId)
    } catch (error) {
        logger.error(`Error in MinerQueries.unEquipAxe: ${Utils.printErrorLog(error)}`);
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
        response = await MinerQueries.unEquipTool(idToolInstance)
    } catch (error) {
        logger.error(`Error in MinerQueries.unEquipTool: ${Utils.printErrorLog(error)}`);
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
        result = await MinerService.getCavesWithMinerAllowance(address);
    } catch (error) {
        logger.error(`Error in MinerService.getCavesWithMinerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    caves = result.caves

    logger.info(`unEquipAxe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                caves
            }
        });
}

async function upgradeAxe(req, res) {

    logger.info(`upgradeAxe START`);

    let validation = MinerValidation.upgradeAxeValidation(req)
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

    let caves, equippedAxeInstanceData
    let result
    try {
        result = await MinerService.getCavesWithMinerAllowance(address)
    } catch (error) {
        logger.error(`Error in MinerService.getCavesWithMinerAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    caves = result.caves

    try {
        equippedAxeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
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

    logger.info(`upgradeAxe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                caves,
                status: response,
                equippedAxeInstanceData
            }
        });
}

async function repairAxe(req, res) {

    logger.info(`repairAxe START`);

    let validation = MinerValidation.repairAxeValidation(req)
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

    let equippedAxeInstanceData

    try {
        equippedAxeInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
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

    logger.info(`repairAxe END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                status: response,
                equippedAxeInstanceData
            }
        });
}

module.exports = {
    getMiner,
    changeAxe,
    startMining,
    unEquipAxe,
    repairAxe,
    upgradeAxe,
    burnPassiveTNT,
    startPassiveMining
}
