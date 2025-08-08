const logger = require('../logging/logger')
const Validator = require('../utils/validator')
const { Utils } = require('../utils/utils')

const { ColonyValidation } = require('../validations/colonyValidation')
const { ColonyService } = require('../services/colonyService')

async function transferNftToColony(req, res) {
  logger.info(`transferNftToColony START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

  // validate input
  let validation = ColonyValidation.transferNftToColonyValidation(req)
  if (!validation.success) {
    return res
      .status(401)
      .json(validation)
  }

  // check validation
  let address = req.locals.address
  let idBuilding = req.body.idBuilding
  let type = req.body.type
  let idColony = req.body.idColony

  // Transfer NFT from main to the Colony
  let response
  try {
    response = await ColonyService.transferNftToColony(address, idColony, idBuilding, type)
  } catch (error) {
    logger.error(`Error in ColonyService.transferNftToColony: ${Utils.printErrorLog(error)}`)
    return res
      .status(401)
      .json({
        success: false,
        error: {
          errorMessage: error
        }
      })
  }

  logger.info(`transferNftToColony response: ${JSON.stringify(response)}`)
  logger.info(`transferNftToColony END`)

  return res
    .status(200)
    .json({
      ...response
    })
}

async function transferNftToMain(req, res) {
  logger.info(`transferNftToMain START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

  // validate input
  let validation = ColonyValidation.transferNftToMainValidation(req)
  if (!validation.success) {
    return res
      .status(401)
      .json(validation)
  }

  // check validation
  let address = req.locals.address
  let idBuilding = req.body.idBuilding
  let type = req.body.type

  // Transfer NFT from main to the Colony
  let response
  try {
    response = await ColonyService.transferNftToMain(address, idBuilding, type)
  } catch (error) {
    logger.error(`Error in ColonyService.transferNftToMain: ${Utils.printErrorLog(error)}`)
    return res
      .status(401)
      .json({
        success: false,
        error: {
          errorMessage: error
        }
      })
  }

  logger.info(`transferNftToMain response: ${JSON.stringify(response)}`)
  logger.info(`transferNftToMain END`)

  return res
    .status(200)
    .json({
      ...response
    })
}

async function addColony(req, res) {
  logger.info(`addColony START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
  logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)

  // VALIDATE INPUT
  let validation
  validation = ColonyValidation.addColonyValidation(req)
  if (!validation.success) {
    return res
      .status(401)
      .json(validation)
  }

  let address = req.locals.address

  // ADD THE Colony
  let response
  try {
    response = await ColonyService.addColony(address)
  } catch (error) {
    logger.error(`Error in ColonyService.addColony: ${Utils.printErrorLog(error)}`)
    return res
      .status(401)
      .json({
        success: false,
        error: {
          errorMessage: error
        }
      })
  }

  logger.info(`addColony response: ${JSON.stringify(response)}`)
  logger.info(`addColony END`)

  return res
    .status(200)
    .json({
      ...response
    })
}

async function getColonies(req, res) {
  logger.info(`getColonies START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
  logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)

  // VALIDATE INPUT
  let validation
  validation = ColonyValidation.getColoniesValidation(req)
  if (!validation.success) {
    return res
      .status(401)
      .json(validation)
  }

  let address = req.locals.address

  // GET THE COLONIES
  let colonies
  try {
    colonies = await ColonyService.getColonies(address)
  } catch (error) {
    logger.error(`Error in ColonyService.getColonies: ${Utils.printErrorLog(error)}`)
    return res
      .status(401)
      .json({
        success: false,
        error: {
          errorMessage: error
        }
      })
  }

  logger.info(`getColonies response: ${JSON.stringify({ success: true, data: colonies })}`)
  logger.info(`getColonies END`)

  return res
    .status(200)
    .json({
      success: true,
      data: colonies
    })
}

module.exports = { transferNftToColony, transferNftToMain, addColony, getColonies }