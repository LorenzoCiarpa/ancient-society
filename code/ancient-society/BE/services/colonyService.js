const logger = require('../logging/logger')

const { ColonyQueries } = require('../queries/colonyQueries')
const { ColonyInterface } = require('../interfaces/JS/colonyInterface')
const { serverConfig } = require('../config/serverConfig')

class ColonyService {
  static async transferNftToColony(address, idColony, idBuilding, type) {
    logger.debug(`transferNftToColony service start`)

    let result

    // check if the address has building with idBuilding and type
    try {
      result = await ColonyQueries.checkIfNftExists(address, idBuilding, type)
      logger.debug(`ColonyQueries.checkIfNftExists response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }
    if (result.length == 0) {
      throw ('The user hasn\'t got the such NFT')
    }
    let nft = result[0]

    // check if the colony city exists
    try {
      result = await ColonyQueries.checkIfColonyExists(address, idColony)
      logger.debug(`ColonyQueries.checkIfColonyExists response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }
    if (result.length == 0) {
      throw ('The user hasn\'t got the colony')
    }

    // transfer the nft to the colony city
    try {
      result = await ColonyQueries.transferNftToColony(address, nft, idColony)
      logger.debug(`ColonyQueries.transferNftToColony response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }

    // transfer the basic tool if the building is Fisherman or Miner
    if (type == 4 || type == 5 || type == 6) {
      try {
        result = await ColonyQueries.transferBasicToolToColony(address, nft, idColony)
        logger.debug(`ColonyQueries.transferBasicToolToColony response : ${JSON.stringify(result)}`)
      } catch (err) {
        throw (err)
      }
    }

    logger.debug(`transferNftToColony service end ${JSON.stringify(result)}`)
    return {
      success: true,
      data: {},
    }
  }

  static async transferNftToMain(address, idBuilding, type) {
    logger.debug(`transferNftToMain service start`)

    let result

    // check if the address has building with idBuilding and type
    try {
      result = await ColonyQueries.checkIfNftExists(address, idBuilding, type)
      logger.debug(`ColonyQueries.checkIfNftExists response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }
    if (result.length == 0) {
      throw ('The user hasn\'t got the such NFT')
    }
    let nft = result[0]

    // get the main address
    let mainAddress = address.split('_')[0]

    // transfer the nft to the main city
    try {
      result = await ColonyQueries.transferNftToMain(mainAddress, nft)
      logger.debug(`ColonyQueries.transferNftToMain response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }

    // transfer the basic tool if the building is Fisherman or Miner
    if (type == 4 || type == 5 || type == 6) {
      try {
        result = await ColonyQueries.transferBasicToolToMain(mainAddress, nft)
        logger.debug(`ColonyQueries.transferBasicToolToMain response : ${JSON.stringify(result)}`)
      } catch (err) {
        throw (err)
      }
    }

    logger.debug(`transferNftToMain service end ${JSON.stringify(result)}`)
    return {
      success: true,
      data: {},
    }
  }

  static async addColony(address) {
    logger.debug(`addColony service start`)

    let result

    // CHECK IF THE COLONY ALREADY MAX
    try {
      result = await ColonyQueries.checkIfColonyLimited(address)
      logger.debug(`ColonyQueries.checkIfColonyExists response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }
    if (result.length != 0 && result[0].counter == serverConfig.colony.cityLimit) {
      return {
        success: false,
        error: {
          errorMessage: `You have reached the max number of colonies.`
        }
      }
    }

    // ADD THE COLONY
    try {
      result = await ColonyQueries.addColony(address)
      logger.debug(`ColonyQueries.addColony response : ${JSON.stringify(result)}`)
    } catch (err) {
      throw (err)
    }

    logger.debug(`addColony service end ${JSON.stringify(result)}`)
    return {
      success: true,
      data: result[5][0],
    }
  }

  static async getColonies(address) {
    logger.debug(`getColonies service start`)

    // GET COLONIES
    let colonies
    try {
      colonies = await ColonyQueries.getColonies(address)
      logger.debug(`ColonyQueries.getColonies response : ${JSON.stringify(colonies)}`)
    } catch (err) {
      throw (err)
    }

    // FORMAT THE RESULT
    colonies = ColonyInterface.buildGetColonies(colonies)

    logger.debug(`getColonies service end`)
    return colonies
  }

}

module.exports = { ColonyService }