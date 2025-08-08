const logger = require("../logging/logger")
const Validator = require("../utils/validator")

class ColonyValidation {
  static transferNftToColonyValidation(req) {
    let address = req.locals.address
    let idBuilding = req.body.idBuilding
    let type = req.body.type
    let idColony = req.body.idColony

    if (!Validator.validateInput(address, idBuilding, type, idColony)) {
      logger.warn(`Error in validateInput (Input null or undefined), address: ${address}, idBuilding: ${idBuilding}, type: ${type}, idColony: ${idColony}`)
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

    if (!Validator.isNaturalInteger(idBuilding)) {
      return {
        success: false,
        error: {
          errorMessage: `idBuilding is not a natural integer`
        }
      }
    }

    if (!Validator.isNaturalInteger(type)) {
      return {
        success: false,
        error: {
          errorMessage: `buildingType is not a natural integer`
        }
      }
    }

    if (!Validator.isNaturalInteger(idColony)) {
      return {
        success: false,
        error: {
          errorMessage: `idColony is not a natural integer`
        }
      }
    }

    return {
      success: true
    }
  }

  static transferNftToMainValidation(req) {
    let address = req.locals.address
    let idBuilding = req.body.idBuilding
    let type = req.body.type

    if (!Validator.validateInput(address, idBuilding, type)) {
      logger.warn(`Error in validateInput (Input null or undefined), address: ${address}, idBuilding: ${idBuilding}, type: ${type}`)
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

    if (!Validator.isNaturalInteger(idBuilding)) {
      return {
        success: false,
        error: {
          errorMessage: `idBuilding is not a natural integer`
        }
      }
    }

    if (!Validator.isNaturalInteger(type)) {
      return {
        success: false,
        error: {
          errorMessage: `buildingType is not a natural integer`
        }
      }
    }

    return {
      success: true
    }
  }

  static addColonyValidation(req) {
    let address = req.locals.address

    if (!Validator.validateInput(address)) {
      logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
      return {
        success: false,
        error: {
          errorMessage: 'Input null or undefined'
        }
      }
    }

    if (!Validator.validateAddress(address)) {
      return {
        success: false,
        error: {
          errorMessage: 'Invalid wallet address'
        }
      }
    }

    return {
      success: true
    }
  }

  static getColoniesValidation(req) {
    let address = req.locals.address

    if (!Validator.validateInput(address)) {
      logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
      return {
        success: false,
        error: {
          errorMessage: 'Input null or undefined'
        }
      }
    }

    if (!Validator.validateAddress(address)) {
      return {
        success: false,
        error: {
          errorMessage: 'Invalid wallet address'
        }
      }
    }

    return {
      success: true
    }
  }

}

module.exports = { ColonyValidation }