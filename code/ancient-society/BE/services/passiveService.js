const logger = require('../logging/logger');
const { FishermanService } = require('./fishermanService');
const { FishermanQueries } = require('../queries/fishermanQueries');
const { MinerService } = require('./minerService');
const { MinerQueries } = require('../queries/minerQueries');
const { FarmerService } = require('./farmerService');
const { FarmerQueries } = require('../queries/farmerQueries');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { Utils } = require("../utils/utils");
const { PassiveQueries } = require('../queries/passiveQueries');
const { UserQueries } = require('../queries/userQueries');
const { InventoryService } = require('../services/inventory/inventoryService');
const { ToolService } = require('./inventory/toolService');
const { serverConfig } = require('../config/serverConfig')

class PassiveService {
    constructor() { }

    static async setPassiveOn(address, buildingType) {
        logger.info(`setPassiveOn service START`)

        // min building-level for passive
        let minBuildingLevelForPassive
        try {
            minBuildingLevelForPassive = await PassiveQueries.getPassiveConstant(buildingType == 4 ? 'minBuildingLevelForPassiveFishing' : 'minBuildingLevelForPassiveMining')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getPkBuildingFromAddress(address, buildingType)
        } catch (error) {
            logger.error(`PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, buildingType)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await PassiveQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.level < minBuildingLevelForPassive) {
            response.done = false
            response.message = `Building level should be at least ${minBuildingLevelForPassive}.`
            return response
        } else if (validate.idPassive != null && validate.isPassive) {
            response.done = false
            response.message = 'Already in passive mode.'
            return response
        } else if (validate.idPassive == null) {
            // substract requirements to unlock = upgrade_requirements for level 1
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, buildingType, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let isUnlockAble = requirements.upgradeAllowed
            if (!isUnlockAble) {
                response.done = false
                response.message = 'Not enough cost to Unlock.'
                return response
            }

            for (let requirement of requirements.requirements) {
                if (requirement.idResourceRequirement != null) {
                    try {
                        await UserQueries.subResources(address, requirement.requiredAncien, requirement.requiredWood, requirement.requiredStone)
                    } catch (error) {
                        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                } else if (requirement.idItemRequirement != null) {
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

            // get data to create new passive
            let passiveLevel
            try {
                passiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(buildingType, 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }
            let maxStorableActions
            try {
                maxStorableActions = await PassiveQueries.getMaxStorableActionCount(buildingType, validate.level)
            } catch (error) {
                logger.error(`PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`
            }

            // insert new row into passive table
            try {
                await PassiveQueries.unLockPassive(pkBuilding, maxStorableActions, passiveLevel.idPassiveLevel)
            } catch (error) {
                logger.error(`PassiveQueries.unLockPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.unLockPassive error : ${Utils.printErrorLog(error)}`
            }

            // update buildings table
            let newPassiveData
            try {
                newPassiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }
            try {
                await PassiveQueries.setIdPassiveAtBuilding(pkBuilding, newPassiveData.idPassive)
            } catch (error) {
                logger.error(`PassiveQueries.setIdPassiveAtBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIdPassiveAtBuilding error : ${Utils.printErrorLog(error)}`
            }

            // storage change return
            let storage = {}
            let resources
            try {
                resources = await UserQueries.getResources(address)
            } catch (error) {
                logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                throw error
            }
            storage.ancien = resources.ancien
            storage.wood = resources.wood
            storage.stone = resources.stone
            response.storage = storage
        } else {
            // set isPassive2true at passive table
            try {
                await PassiveQueries.setIsPassiveAtPassive(validate.idPassive, true)
            } catch (error) {
                logger.error(`PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`
            }
        }

        response.done = true
        response.message = 'Successfully done'

        // call getFisherman or getMiner
        if (buildingType == 4) {
            let fishermanResponse
            try {
                fishermanResponse = await PassiveService.getFisherman(address)
            } catch (error) {
                logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
            }
            response.fishermanResponse = fishermanResponse
        }
        if (buildingType == 5) {
            let minerResponse
            try {
                minerResponse = await PassiveService.getMiner(address)
            } catch (error) {
                logger.error(`PassiveService.getMiner error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getMiner error : ${Utils.printErrorLog(error)}`
            }
            response.minerResponse = minerResponse
        }
        if (buildingType == 6) {
            let farmerResponse
            try {
                farmerResponse = await PassiveService.getFarmer(address)
            } catch (error) {
                logger.error(`PassiveService.getFarmer error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getFarmer error : ${Utils.printErrorLog(error)}`
            }
            response.farmerResponse = farmerResponse
        }

        logger.info(`setPassiveOn service END`)
        return response
    }
    static async setPassiveOff(address, buildingType) {
        logger.info(`setPassiveOff service START`)

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getPkBuildingFromAddress(address, buildingType)
        } catch (error) {
            logger.error(`PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, buildingType)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.idPassive != null && validate.isPassive) {
            // set isPassive2false at passive table
            try {
                await PassiveQueries.setIsPassiveAtPassive(validate.idPassive, false)
            } catch (error) {
                logger.error(`PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`
            }
        } else {
            response.done = false
            response.message = 'Already in active mode.'
            return response
        }

        response.done = true
        response.message = 'Successfully done'

        // call getPassiveInfo
        let passiveInfo
        try {
            passiveInfo = await PassiveService.getPassiveInfo1(address, buildingType)
        } catch (error) {
            logger.error(`PassiveService.getPassiveInfo1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.getPassiveInfo1 error : ${Utils.printErrorLog(error)}`
        }

        if (buildingType == 4) {
            response.fishermanResponse = passiveInfo
        }
        if (buildingType == 5) {
            response.minerResponse = passiveInfo
        }
        if (buildingType == 6) {
            response.farmerResponse = passiveInfo
        }

        // call getFisherman
        // let fishermanResponse
        // try {
        //     fishermanResponse = await PassiveService.getFisherman(address)
        // } catch ( error ) {
        //     logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
        //     throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
        // }
        // response.fishermanResponse = fishermanResponse

        logger.info(`setPassiveOff service END`)
        return response
    }
    static async upgradePassive(address, buildingType) {
        logger.info(`upgradePassive service START`)

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getPkBuildingFromAddress(address, buildingType)
        } catch (error) {
            logger.error(`PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, buildingType)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.idPassive != null) {
            let passiveData
            try {
                passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }
            if (!passiveData.isUpgradable) {
                response.done = false
                response.message = 'Passive Level is already at Max Level.'
                return response
            }

            // sub upgrade requirements
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, buildingType, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let upgradeAllowed = requirements.upgradeAllowed
            if (!upgradeAllowed) {
                response.done = false
                response.message = 'Not enough cost to Upgrade.'
                return response
            }
            for (let requirement of requirements.requirements) {
                if (requirement.idResourceRequirement != null) {
                    try {
                        await UserQueries.subResources(address, requirement.requiredAncien, requirement.requiredWood, requirement.requiredStone)
                    } catch (error) {
                        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                } else if (requirement.idItemRequirement != null) {
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
            let storage = {}
            let resources
            try {
                resources = await UserQueries.getResources(address)
            } catch (error) {
                logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                throw error
            }
            storage.ancien = resources.ancien
            storage.wood = resources.wood
            storage.stone = resources.stone
            response.storage = storage

            let passiveLevel
            try {
                passiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(buildingType, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }

            try {
                await PassiveQueries.setIdPassiveLevelAtPassive(passiveData.idPassive, passiveLevel.idPassiveLevel)
            } catch (error) {
                logger.error(`PassiveQueries.setIdPassiveLevelAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIdPassiveLevelAtPassive error : ${Utils.printErrorLog(error)}`
            }

            /* try {
                await PassiveQueries.updateLastPassiveTime(passiveData.idPassive)
            } catch (error) {
                logger.error(`PassiveQueries.updateLastPassiveTime error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.updateLastPassiveTime error : ${Utils.printErrorLog(error)}`
            } */

            /* response.upgradeInfo = {
                level: passiveLevel.level
            } */
        } else {
            response.done = false
            response.message = 'You should unlock passive mode first.'
            return response
        }

        response.done = true
        response.message = 'Successfully done'

        // call getFisherman or getMiner
        if (buildingType == 4) {
            let fishermanResponse
            try {
                fishermanResponse = await PassiveService.getFisherman(address)
            } catch (error) {
                logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
            }
            response.fishermanResponse = fishermanResponse
        }
        if (buildingType == 5) {
            let minerResponse
            try {
                minerResponse = await PassiveService.getMiner(address)
            } catch (error) {
                logger.error(`PassiveService.getMiner error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getMiner error : ${Utils.printErrorLog(error)}`
            }
            response.minerResponse = minerResponse
        }
        if (buildingType == 6) {
            let farmerResponse
            try {
                farmerResponse = await PassiveService.getFarmer(address)
            } catch (error) {
                logger.error(`PassiveService.getFarmer error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getFarmer error : ${Utils.printErrorLog(error)}`
            }
            response.farmerResponse = farmerResponse
        }

        logger.info(`upgradePassive service END`)
        return response
    }
    static async updatePassiveStatus1(pkBuilding, buildingType) {
        logger.info(`updatePassiveStatus1 service START`)

        let validate
        try {
            validate = await PassiveQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        if (validate.idPassive != null && validate.isPassive) {
            // update MaxStorableActions based on Building level
            let maxStorableActions
            try {
                maxStorableActions = await PassiveQueries.getMaxStorableActionCount(buildingType, validate.level)
            } catch (error) {
                logger.error(`PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`
            }
            //ADD a check and not perform it anywhere wuld it a bit better
            try {
                await PassiveQueries.updateMaxStorableActions(pkBuilding, maxStorableActions)
            } catch (error) {
                logger.error(`PassiveQueries.updateMaxStorableActions error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.updateMaxStorableActions error : ${Utils.printErrorLog(error)}`
            }

            let passiveData
            try {
                passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }

            let nowTime = (new Date()).getTime()
            let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
            let duringTime = passiveData.actionCoolDown * 60 * 1000
            let duringActions = Math.floor((nowTime - lastTime) / duringTime)
            lastTime += duringActions * duringTime

            let storedActions = Math.min(passiveData.storedActions + duringActions, passiveData.maxStorableActions)
            let lastPassiveTime = (new Date(lastTime)).toISOString().slice(0, -1)
            //Here in calculateStoredActions with SET there could be a bug abuse with fast sequential fishes

            try {
                await PassiveQueries.calculateStoredActions(passiveData.idPassive, storedActions, lastPassiveTime)
            } catch (error) {
                logger.error(`PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`
            }
        }

        logger.info(`updatePassiveStatus1 service END`)
    }
    static async getUpgradeRequirements1(address, buildingType, level) {
        logger.info(`passiveService.getUpgradeRequirements1 START`)

        let requirements
        try {
            requirements = await PassiveQueries.getUpgradeRequirements1(address, buildingType, level)
        } catch (error) {
            logger.error(`PassiveQueries.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
        }
        let upgradeAllowed = true
        let requirementsArray = []
        for (let requirement of requirements) {
            if (requirement.idResourceRequirement != null) {
                if (!(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed)) {
                    upgradeAllowed = false
                }
                if (requirement.requiredAncien != 0) {
                    requirementsArray.push({
                        name: 'ancien',
                        image: serverConfig.ANCIEN_IMAGE,
                        quantity: requirement.requiredAncien,
                        isAllowed: requirement.isAncienAllowed
                    })
                }
                if (requirement.requiredWood != 0) {
                    requirementsArray.push({
                        name: 'wood',
                        image: serverConfig.WOOD_IMAGE,
                        quantity: requirement.requiredWood,
                        isAllowed: requirement.isWoodAllowed
                    })
                }
                if (requirement.requiredStone != 0) {
                    requirementsArray.push({
                        name: 'stone',
                        image: serverConfig.STONE_IMAGE,
                        quantity: requirement.requiredStone,
                        isAllowed: requirement.isStoneAllowed
                    })
                }
            } else if (requirement.idItemRequirement != null) {
                if (!requirement.isItemAllowed) {
                    upgradeAllowed = false
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
        }

        logger.info(`passiveService.getUpgradeRequirements1 END`)
        return { upgradeAllowed: upgradeAllowed, requirementsArray: requirementsArray, requirements: requirements }
    }
    static async getPassiveInfo1(address, buildingType) {
        logger.info(`passiveService.getPassiveInfo1 START`)
        // data for passiveFishing
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getPkBuildingFromAddress(address, buildingType)
        } catch (error) {
            logger.error(`PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        let response = {}

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, buildingType, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            response.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, buildingType, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(buildingType, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                if (buildingType == 4) {
                    response.passiveInfo = {
                        isPassive: false,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        fishingCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        }
                    }
                }
                if (buildingType == 5) {
                    response.passiveInfo = {
                        isPassive: false,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        miningCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            miningCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        }
                    }
                }
                if (buildingType == 6) {
                    response.passiveInfo = {
                        isPassive: false,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        farmingCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            farmingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        }
                    }
                }
            } else {
                if (buildingType == 4) {
                    // get Lure Item Full Data using idPassiveFishingLureItem at constant table
                    let idPassiveFishingLureItem
                    try {
                        idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }
                    let lureData
                    try {
                        lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                    }
                    if (lureData == undefined) {
                        try {
                            lureData = await PassiveQueries.getItemData(idPassiveFishingLureItem)
                        } catch (error) {
                            logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                            throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                        }
                        lureData.quantity = 0
                    }

                    // check the max number of consecutive fishing actions (resource.ancien & rod.durability & passiveData.storedActions)
                    let ancienCostPerEachFishingAction
                    try {
                        ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

                    let resources
                    try {
                        resources = await UserQueries.getResources(address)
                    } catch (error) {
                        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                        throw error
                    }
                    let ancien = resources.ancien

                    let rodDurability
                    try {
                        rodDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
                    } catch (error) {
                        logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
                        throw error
                    }
                    rodDurability = !rodDurability ? 0 : rodDurability

                    let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFishingAction), passiveData.storedActions, passiveData.burntActions, Math.floor(rodDurability / 10))

                    // get basic constant data for passiveFishing
                    let actionCountPerFishingLure
                    try {
                        actionCountPerFishingLure = await PassiveQueries.getPassiveConstant('actionCountPerFishingLure')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

                    // get next store time
                    let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                    let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                    // build response
                    response.passiveInfo = {
                        isPassive: true,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        fishingCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        },

                        lureData: lureData,

                        constant: {
                            actionCountPerFishingLure: actionCountPerFishingLure,
                            ancienCostPerEachFishingAction: ancienCostPerEachFishingAction,
                        },

                        storedActions: passiveData.storedActions,
                        burntActions: passiveData.burntActions,
                        maxStorableActions: passiveData.maxStorableActions,
                        maxPerformableActions: maxPerformableActions,
                        nextStoreTime: nextStoreTime
                    }
                }
                if (buildingType == 5) {
                    // get TNT Item Full Data using idPassiveMiningTNTItem at constant table
                    let idPassiveMiningTNTItem
                    try {
                        idPassiveMiningTNTItem = await PassiveQueries.getPassiveConstant('idPassiveMiningTNTItem')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }
                    let tntData
                    try {
                        tntData = await PassiveQueries.getItemInstanceData(address, idPassiveMiningTNTItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                    }
                    if (tntData == undefined) {
                        try {
                            tntData = await PassiveQueries.getItemData(idPassiveMiningTNTItem)
                        } catch (error) {
                            logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                            throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                        }
                        tntData.quantity = 0
                    }

                    // check the max number of consecutive mining actions (resource.ancien & axe.durability & passiveData.storedActions)
                    let ancienCostPerEachMiningAction
                    try {
                        ancienCostPerEachMiningAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachMiningAction')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

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

                    let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachMiningAction), passiveData.storedActions, passiveData.burntActions, Math.floor(axeDurability / 10))

                    // get basic constant data for passiveMining
                    let actionCountPerMiningTNT
                    try {
                        actionCountPerMiningTNT = await PassiveQueries.getPassiveConstant('actionCountPerMiningTNT')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

                    // get next store time
                    let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                    let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                    // build response
                    response.passiveInfo = {
                        isPassive: true,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        miningCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            miningCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        },

                        tntData: tntData,

                        constant: {
                            actionCountPerMiningTNT: actionCountPerMiningTNT,
                            ancienCostPerEachMiningAction: ancienCostPerEachMiningAction,
                        },

                        storedActions: passiveData.storedActions,
                        burntActions: passiveData.burntActions,
                        maxStorableActions: passiveData.maxStorableActions,
                        maxPerformableActions: maxPerformableActions,
                        nextStoreTime: nextStoreTime
                    }
                }
                if (buildingType == 6) {
                    // get Seed Item Full Data using idPassiveFarmingSEEDItem at constant table
                    let idPassiveFarmingSEEDItem
                    try {
                        idPassiveFarmingSEEDItem = await PassiveQueries.getPassiveConstant('idPassiveFarmingSEEDItem')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }
                    let seedData
                    try {
                        seedData = await PassiveQueries.getItemInstanceData(address, idPassiveFarmingSEEDItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                    }
                    if (seedData == undefined) {
                        try {
                            seedData = await PassiveQueries.getItemData(idPassiveFarmingSEEDItem)
                        } catch (error) {
                            logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                            throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                        }
                        seedData.quantity = 0
                    }

                    // check the max number of consecutive farming actions (resource.ancien & hoe.durability & passiveData.storedActions)
                    let ancienCostPerEachFarmingAction
                    try {
                        ancienCostPerEachFarmingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFarmingAction')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

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

                    let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFarmingAction), passiveData.storedActions, passiveData.burntActions, Math.floor(hoeDurability / 10))

                    // get basic constant data for passiveMining
                    let actionCountPerFarmingSEED
                    try {
                        actionCountPerFarmingSEED = await PassiveQueries.getPassiveConstant('actionCountPerFarmingSEED')
                    } catch (error) {
                        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                    }

                    // get next store time
                    let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                    let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                    // build response
                    response.passiveInfo = {
                        isPassive: true,
                        locked: false,
                        passiveLevel: passiveData.passiveLevel,
                        farmingCoolDown: passiveData.actionCoolDown,
                        upgradeInfo: {
                            isUpgradable: passiveData.isUpgradable,
                            passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                            farmingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                            upgradeAllowed: requirements.upgradeAllowed,
                            upgradeRequirements: requirements.requirementsArray,
                        },

                        seedData: seedData,

                        constant: {
                            actionCountPerFarmingSEED: actionCountPerFarmingSEED,
                            ancienCostPerEachFarmingAction: ancienCostPerEachFarmingAction,
                        },

                        storedActions: passiveData.storedActions,
                        burntActions: passiveData.burntActions,
                        maxStorableActions: passiveData.maxStorableActions,
                        maxPerformableActions: maxPerformableActions,
                        nextStoreTime: nextStoreTime
                    }
                }
            }
        }

        logger.info(`passiveService.getPassiveInfo1 END`)
        return response
    }

    static async getFisherman(address) {
        logger.info(`passiveService.getFisherman START`)

        let result
        try {
            result = await FishermanService.getSeasWithFishermanAllowance(address)
        } catch (error) {
            throw error
        }
        let seas = result.seas
        let checkFisherman = result.checkFisherman

        let fishermanResponse = { hasConsumables: false, consumables: [], rods: [], seas: seas, fishermanIsFishing: checkFisherman[0].nowFishing, fishermanEndingTime: checkFisherman[0].fishingEndingTime, rodEndingTime: '' }

        let consumables
        try {
            consumables = await InventoryQueries.getFishConsumables(address)
        } catch (error) {
            throw error
        }
        fishermanResponse.hasConsumables = consumables.length == 0 ? false : true
        for (var i = 0; i < consumables.length; ++i) {
            fishermanResponse.consumables.push({
                id: consumables[i].idItemConsumable,
                name: consumables[i].name,
                image: consumables[i].image,
                description: consumables[i].description,
                quantity: consumables[i].quantity
            })
        }

        let rods
        try {
            rods = await FishermanQueries.getRods(address)
        } catch (error) {
            logger.error(`FishermanQueries.getRods error : ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolIds = []
        for (let rod of rods) {
            toolIds.push(rod.id)
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

            for (let rod of rods) {
                rod.bonuses = toolBonuses[rod.id] ? toolBonuses[rod.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        let rodId = -1
        let equippedRodIndex = -1
        for (var i = 0; i < rods.length; ++i) {
            if (rods[i].equipped) equippedRodIndex = i
            if (rodId == rods[i].id) {
                continue
            }
            rodId = rods[i].id
            fishermanResponse.rods.push({
                id: rods[i].id,
                bonuses: rods[i].bonuses,
                level: rods[i].level,
                name: rods[i].name,
                image: rods[i].image,
                rarity: rods[i].rarity,
                durability: rods[i].durability,
                status: (rods[i].equipped ? 'equipped' : (
                    rods[i].rarity == 1 ? 'available' : (
                        rods[i].rarity == 2 ? 'available' : (
                            rods[i].rarity == 3 ? (checkFisherman[0].level >= 7 ? 'available' : 'not-available') : 'unknown rarity'
                        )
                    )
                )),
                isFishing: rods[i].isFishing
            })
            if (checkFisherman[0].idToolInstance == rods[i].id) {
                fishermanResponse.rodEndingTime = rods[i].rodEndingTime
            }
        }

        if (equippedRodIndex == -1) {
            fishermanResponse.hasEquippedRod = false
            fishermanResponse.equippedRodInstanceData = null
        } else {
            fishermanResponse.hasEquippedRod = true
            let equippedRodInstanceData
            try {
                equippedRodInstanceData = await InventoryService.getInventoryInstanceData(address, rods[equippedRodIndex].id, 'tool')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
                throw error
            }

            let toolIds = []
            toolIds.push(equippedRodInstanceData.id)
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

                equippedRodInstanceData.bonuses = toolBonuses[equippedRodInstanceData.id] ? toolBonuses[equippedRodInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }

            fishermanResponse.equippedRodInstanceData = equippedRodInstanceData
        }

        // data for passiveFishing
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, 4)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 4, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            fishermanResponse.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 4, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(4, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                fishermanResponse.passiveInfo = {
                    isPassive: false,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    }
                }
            } else {
                // get Lure Item Full Data using idPassiveFishingLureItem at constant table
                let idPassiveFishingLureItem
                try {
                    idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }
                let lureData
                try {
                    lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
                } catch (error) {
                    logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                }
                if (lureData == undefined) {
                    try {
                        lureData = await PassiveQueries.getItemData(idPassiveFishingLureItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                    }
                    lureData.quantity = 0
                }

                // check the max number of consecutive fishing actions (resource.ancien & rod.durability & passiveData.storedActions)
                let ancienCostPerEachFishingAction
                try {
                    ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                let resources
                try {
                    resources = await UserQueries.getResources(address)
                } catch (error) {
                    logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                let ancien = resources.ancien

                let rodDurability
                try {
                    rodDurability = await PassiveQueries.getEquippedToolDurabilityFromPkBuilding(pkBuilding)
                } catch (error) {
                    logger.error(`Error in PassiveQueries.getEquippedToolDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                rodDurability = !rodDurability ? 0 : rodDurability

                let maxPerformableActions = Math.min(passiveData.storedActions, passiveData.burntActions, Math.floor(rodDurability / 10))

                // get basic constant data for passiveFishing
                let actionCountPerFishingLure
                try {
                    actionCountPerFishingLure = await PassiveQueries.getPassiveConstant('actionCountPerFishingLure')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                // get next store time
                let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                // build response
                fishermanResponse.passiveInfo = {
                    isPassive: true,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    },

                    lureData: lureData,

                    constant: {
                        actionCountPerFishingLure: actionCountPerFishingLure,
                        ancienCostPerEachFishingAction: ancienCostPerEachFishingAction,
                    },

                    storedActions: passiveData.storedActions,
                    burntActions: passiveData.burntActions,
                    maxStorableActions: passiveData.maxStorableActions,
                    maxPerformableActions: maxPerformableActions,
                    nextStoreTime: nextStoreTime
                }
            }
        }

        logger.info(`passiveService.getFisherman END`)
        return fishermanResponse
    }
    static async getMiner(address) {
        logger.info(`passiveService.getMiner START`)

        let result
        try {
            result = await MinerService.getCavesWithMinerAllowance(address)
        } catch (error) {
            throw error
        }
        let caves = result.caves
        let checkMiner = result.checkMiner

        let minerResponse = { hasConsumables: false, consumables: [], axes: [], caves: caves, minerIsMining: checkMiner[0].nowMining, minerEndingTime: checkMiner[0].miningEndingTime, axeEndingTime: '' }

        let consumables
        try {
            consumables = await InventoryQueries.getMineConsumables(address)
        } catch (error) {
            throw error
        }
        minerResponse.hasConsumables = consumables.length == 0 ? false : true
        for (var i = 0; i < consumables.length; ++i) {
            minerResponse.consumables.push({
                id: consumables[i].idItemConsumable,
                name: consumables[i].name,
                image: consumables[i].image,
                description: consumables[i].description,
                quantity: consumables[i].quantity
            })
        }

        let axes
        try {
            axes = await MinerQueries.getAxes(address)
        } catch (error) {
            logger.error(`MinerQueries.getAxes error : ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolIds = []
        for (let axe of axes) {
            toolIds.push(axe.id)
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

            for (let axe of axes) {
                axe.bonuses = toolBonuses[axe.id] ? toolBonuses[axe.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        let axeId = -1
        let equippedAxeIndex = -1
        for (var i = 0; i < axes.length; ++i) {
            if (axes[i].equipped) equippedAxeIndex = i
            if (axeId == axes[i].id) {
                continue
            }
            axeId = axes[i].id
            minerResponse.axes.push({
                id: axes[i].id,
                bonuses: axes[i].bonuses,
                level: axes[i].level,
                name: axes[i].name,
                image: axes[i].image,
                rarity: axes[i].rarity,
                durability: axes[i].durability,
                status: (axes[i].equipped ? 'equipped' : (
                    axes[i].rarity == 1 ? 'available' : (
                        axes[i].rarity == 2 ? 'available' : (
                            axes[i].rarity == 3 ? (checkMiner[0].level >= 7 ? 'available' : 'not-available') : 'unknown rarity'
                        )
                    )
                )),
                isMining: axes[i].isMining
            })
            if (checkMiner[0].idToolInstance == axes[i].id) {
                minerResponse.axeEndingTime = axes[i].axeEndingTime
            }
        }

        if (equippedAxeIndex == -1) {
            minerResponse.hasEquippedAxe = false
            minerResponse.equippedAxeInstanceData = null
        } else {
            minerResponse.hasEquippedAxe = true
            let equippedAxeInstanceData
            try {
                equippedAxeInstanceData = await InventoryService.getInventoryInstanceData(address, axes[equippedAxeIndex].id, 'tool')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
                throw error
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
                    throw error
                }
                logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

                equippedAxeInstanceData.bonuses = toolBonuses[equippedAxeInstanceData.id] ? toolBonuses[equippedAxeInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }

            minerResponse.equippedAxeInstanceData = equippedAxeInstanceData
        }

        // data for passiveMining
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getMinerPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getMinerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getMinerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, 5)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 5, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            minerResponse.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 5, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(5, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                minerResponse.passiveInfo = {
                    isPassive: false,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    miningCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        miningCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    }
                }
            } else {
                // get TNT Item Full Data using idPassiveMiningTNTItem at constant table
                let idPassiveMiningTNTItem
                try {
                    idPassiveMiningTNTItem = await PassiveQueries.getPassiveConstant('idPassiveMiningTNTItem')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }
                let tntData
                try {
                    tntData = await PassiveQueries.getItemInstanceData(address, idPassiveMiningTNTItem)
                } catch (error) {
                    logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                }
                if (tntData == undefined) {
                    try {
                        tntData = await PassiveQueries.getItemData(idPassiveMiningTNTItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                    }
                    tntData.quantity = 0
                }

                // check the max number of consecutive mining actions (resource.ancien & axe.durability & passiveData.storedActions)
                let ancienCostPerEachMiningAction
                try {
                    ancienCostPerEachMiningAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachMiningAction')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

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

                let maxPerformableActions = Math.min(passiveData.storedActions, passiveData.burntActions, Math.floor(axeDurability / 10))

                // get basic constant data for passiveMining
                let actionCountPerMiningTNT
                try {
                    actionCountPerMiningTNT = await PassiveQueries.getPassiveConstant('actionCountPerMiningTNT')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                // get next store time
                let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                // build response
                minerResponse.passiveInfo = {
                    isPassive: true,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    miningCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        miningCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    },

                    tntData: tntData,

                    constant: {
                        actionCountPerMiningTNT: actionCountPerMiningTNT,
                        ancienCostPerEachMiningAction: ancienCostPerEachMiningAction,
                    },

                    storedActions: passiveData.storedActions,
                    burntActions: passiveData.burntActions,
                    maxStorableActions: passiveData.maxStorableActions,
                    maxPerformableActions: maxPerformableActions,
                    nextStoreTime: nextStoreTime
                }
            }
        }

        logger.info(`passiveService.getMiner END`)
        return minerResponse
    }
    static async getFarmer(address) {
        logger.info(`passiveService.getFarmer START`)

        let result
        try {
            result = await FarmerService.getFieldsWithFarmerAllowance(address)
        } catch (error) {
            throw error
        }
        let fields = result.fields
        let checkFarmer = result.checkFarmer

        let farmerResponse = { hasConsumables: false, consumables: [], hoes: [], fields: fields, farmerIsFarming: checkFarmer[0].nowFarming, farmerEndingTime: checkFarmer[0].farmingEndingTime, hoeEndingTime: '' }

        let consumables
        try {
            consumables = await InventoryQueries.getFarmConsumables(address)
        } catch (error) {
            throw error
        }
        farmerResponse.hasConsumables = consumables.length == 0 ? false : true
        for (var i = 0; i < consumables.length; ++i) {
            farmerResponse.consumables.push({
                id: consumables[i].idItemConsumable,
                name: consumables[i].name,
                image: consumables[i].image,
                description: consumables[i].description,
                quantity: consumables[i].quantity
            })
        }

        let hoes
        try {
            hoes = await FarmerQueries.getHoes(address)
        } catch (error) {
            logger.error(`FarmerQueries.getHoes error : ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolIds = []
        for (let hoe of hoes) {
            toolIds.push(hoe.id)
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

            for (let hoe of hoes) {
                hoe.bonuses = toolBonuses[hoe.id] ? toolBonuses[hoe.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        let hoeId = -1
        let equippedHoeIndex = -1
        for (var i = 0; i < hoes.length; ++i) {
            if (hoes[i].equipped) equippedHoeIndex = i
            if (hoeId == hoes[i].id) {
                continue
            }
            hoeId = hoes[i].id
            farmerResponse.hoes.push({
                id: hoes[i].id,
                bonuses: hoes[i].bonuses,
                level: hoes[i].level,
                name: hoes[i].name,
                image: hoes[i].image,
                rarity: hoes[i].rarity,
                durability: hoes[i].durability,
                status: (hoes[i].equipped ? 'equipped' : (
                    hoes[i].rarity == 1 ? 'available' : (
                        hoes[i].rarity == 2 ? 'available' : (
                            hoes[i].rarity == 3 ? (checkFarmer[0].level >= 7 ? 'available' : 'not-available') : 'unknown rarity'
                        )
                    )
                )),
                isFarming: hoes[i].isFarming
            })
            if (checkFarmer[0].idToolInstance == hoes[i].id) {
                farmerResponse.hoeEndingTime = hoes[i].hoeEndingTime
            }
        }

        if (equippedHoeIndex == -1) {
            farmerResponse.hasEquippedHoe = false
            farmerResponse.equippedHoeInstanceData = null
        } else {
            farmerResponse.hasEquippedHoe = true
            let equippedHoeInstanceData
            try {
                equippedHoeInstanceData = await InventoryService.getInventoryInstanceData(address, hoes[equippedHoeIndex].id, 'tool')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
                throw error
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
                    throw error
                }
                logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

                equippedHoeInstanceData.bonuses = toolBonuses[equippedHoeInstanceData.id] ? toolBonuses[equippedHoeInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }

            farmerResponse.equippedHoeInstanceData = equippedHoeInstanceData
        }

        // data for passiveFarming
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFarmerPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFarmerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFarmerPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus1(pkBuilding, 6)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus1 error : ${Utils.printErrorLog(error)}`
        }

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 6, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            farmerResponse.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements1(address, 6, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements1 error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel1(6, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel1 error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                farmerResponse.passiveInfo = {
                    isPassive: false,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    farmingCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        farmingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    }
                }
            } else {
                // get Seed Item Full Data using idPassiveFarmingSEEDItem at constant table
                let idPassiveFarmingSEEDItem
                try {
                    idPassiveFarmingSEEDItem = await PassiveQueries.getPassiveConstant('idPassiveFarmingSEEDItem')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }
                let seedData
                try {
                    seedData = await PassiveQueries.getItemInstanceData(address, idPassiveFarmingSEEDItem)
                } catch (error) {
                    logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                }
                if (seedData == undefined) {
                    try {
                        seedData = await PassiveQueries.getItemData(idPassiveFarmingSEEDItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                    }
                    seedData.quantity = 0
                }

                // check the max number of consecutive farming actions (resource.ancien & hoe.durability & passiveData.storedActions)
                let ancienCostPerEachFarmingAction
                try {
                    ancienCostPerEachFarmingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFarmingAction')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

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

                let maxPerformableActions = Math.min(passiveData.storedActions, passiveData.burntActions, Math.floor(hoeDurability / 10))

                // get basic constant data for passiveFarming
                let actionCountPerFarmingSEED
                try {
                    actionCountPerFarmingSEED = await PassiveQueries.getPassiveConstant('actionCountPerFarmingSEED')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                // get next store time
                let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                let nextStoreTime = (new Date(lastTime + passiveData.actionCoolDown * 60 * 1000)).toISOString().slice(0, -1)

                // build response
                farmerResponse.passiveInfo = {
                    isPassive: true,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    farmingCoolDown: passiveData.actionCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        farmingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.actionCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    },

                    seedData: seedData,

                    constant: {
                        actionCountPerFarmingSEED: actionCountPerFarmingSEED,
                        ancienCostPerEachFarmingAction: ancienCostPerEachFarmingAction,
                    },

                    storedActions: passiveData.storedActions,
                    burntActions: passiveData.burntActions,
                    maxStorableActions: passiveData.maxStorableActions,
                    maxPerformableActions: maxPerformableActions,
                    nextStoreTime: nextStoreTime
                }
            }
        }

        logger.info(`passiveService.getFarmer END`)
        return farmerResponse
    }
}

module.exports = { PassiveService }