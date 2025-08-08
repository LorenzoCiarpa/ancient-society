const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class MinerValidation {
    static burnPassiveTNTValidation(req) {
        let address = req.locals.address;
        let burnTNTCount = req.body.burnTNTCount;

        if (!Validator.validateInput(address, burnTNTCount)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, burnTNTCount: ${burnTNTCount}`);
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

        if (!Validator.isNaturalInteger(burnTNTCount)) {
            return {
                success: false,
                error: {
                    errorMessage: `burnTNTCount is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }
    static unEquipAxeValidator(req) {
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

    static getMinerValidation(req) {
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

    static changeAxeValidator(req) {
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

    static passiveMineValidation(req) {
        let address = req.locals.address;
        let idCave = req.body.idCave;
        let consumableIds = req.body.consumableIds
        let actionNumber = req.body.actionNumber

        if (!Validator.validateInput(address, idCave, consumableIds, actionNumber)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idCave: ${idCave}, consumableIds: ${JSON.stringify(consumableIds)}, actionNumber: ${actionNumber}`);
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

        if (!Validator.isPositiveInteger(idCave)) {
            return {
                success: false,
                error: {
                    errorMessage: "idCave is not a positive integer"
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

    static mineValidation(req) {
        let address = req.locals.address;
        let idCave = req.body.idCave;
        let consumableIds = req.body.consumableIds

        if (!Validator.validateInput(address, idCave, consumableIds)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idCave: ${idCave}, consumableIds: ${JSON.stringify(consumableIds)}`);
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

        if (!Validator.isPositiveInteger(idCave)) {
            return {
                success: false,
                error: {
                    errorMessage: "idCave is not a positive integer"
                }
            }
        }

        return {
            success: true
        }
    }

    static upgradeAxeValidation(req) {
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

    static repairAxeValidation(req) {
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

module.exports = { MinerValidation }