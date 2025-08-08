const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class FarmerValidation {
    static burnPassiveSeedValidation(req) {
        let address = req.locals.address;
        let burnSeedCount = req.body.burnSeedCount;

        if (!Validator.validateInput(address, burnSeedCount)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, burnSeedCount: ${burnSeedCount}`);
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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(burnSeedCount)) {
            return {
                success: false,
                error: {
                    errorMessage: `burnSeedCount is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }
    static unEquipHoeValidator(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;

        if (!Validator.validateInput(address, idToolInstance)) {
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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(idToolInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static getFarmerValidation(req) {
        let address = req.locals.address
        if (!Validator.validateInput(address)) {
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }
        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }
        return {
            success: true
        }
    }

    static changeHoeValidator(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;

        if (!Validator.validateInput(address, idToolInstance)) {
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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(idToolInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not a natural integer`
                }
            }
        }

        // if(!Validator.validateType(type)){
        //     return {
        //         success: false,
        //         error: {
        //             errorMessage: `type is not a type`
        //         }
        //     }
        // }

        return {
            success: true
        }
    }

    static passiveFarmValidation(req) {
        let address = req.locals.address;
        let idField = req.body.idField;
        let consumableIds = req.body.consumableIds
        let actionNumber = req.body.actionNumber

        if (!Validator.validateInput(address, idField, consumableIds, actionNumber)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idField: ${idField}, consumableIds: ${JSON.stringify(consumableIds)}, actionNumber: ${actionNumber}`);
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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isPositiveInteger(idField)) {
            return {
                success: false,
                error: {
                    errorMessage: "idField is not a positive integer"
                }
            }
        }


        if (!Validator.isPositiveInteger(actionNumber)) {
            return {
                success: false,
                error: {
                    errorMessage: "actionNumber is not a positive integer"
                }
            }
        }

        return {
            success: true
        }
    }

    static farmValidation(req) {
        let address = req.locals.address;
        let idField = req.body.idField;
        let consumableIds = req.body.consumableIds

        if (!Validator.validateInput(address, idField, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idField: ${idField}, consumableIds: ${JSON.stringify(consumableIds)}`);
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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isPositiveInteger(idField)) {
            return {
                success: false,
                error: {
                    errorMessage: "idField is not a positive integer"
                }
            }
        }

        return {
            success: true
        }
    }

    static upgradeHoeValidation(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance
        let consumableIds = req.body.consumableIds

        if (!Validator.validateInput(address, idToolInstance, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
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
        if (!Validator.isPositiveInteger(idToolInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }
        /* for (let consumableId of consumableIds) {
            if(!Validator.isPositiveInteger(consumableId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `consumableId is not an integer > 0`
                    }
                }
            }
        } */
        return {
            success: true
        }
    }

    static repairHoeValidation(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance
        let consumableIds = req.body.consumableIds

        if (!Validator.validateInput(address, idToolInstance, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
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
        if (!Validator.isPositiveInteger(idToolInstance)) {
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }
        /* for (let consumableId of consumableIds) {
            if(!Validator.isPositiveInteger(consumableId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `consumableId is not an integer > 0`
                    }
                }
            }
        } */
        return {
            success: true
        }
    }
}

module.exports = { FarmerValidation }