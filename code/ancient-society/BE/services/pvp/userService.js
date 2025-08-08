const logger = require('../../logging/logger');
const { UserQueries } = require('../../queries/pvp/userQueries');
const {Utils} = require("../../utils/utils");
class UserService {
  static async checkUser(address) {
    let user;

    try {
        [ user ] = await UserQueries.getUser(address);
    } catch (error) {
        logger.error(`Error in InventoryQueries getUser : ${Utils.printErrorLog(error)} `);
        throw(error);
    }

    return user ? true : false;
  }

  static async createUserPvp(address, userData) {
      let user;

      try {
          user  = await UserQueries.createUser(address, userData);
      } catch (error) {
          logger.error(`Error in UserQueries createUser : ${Utils.printErrorLog(error)} `)
          throw(error);
      }

      return user;  
  }

  static async getUser(address){
    let response = {}
    let user
    try {
        user  = await UserQueries.getUserInfos(address);
    } catch (error) {
        logger.error(`Error in UserQueries getUser : ${Utils.printErrorLog(error)} `)
        throw(error);
    }
    if(user.length != 1) throw(`User not found`);
    user=user[0]
    logger.debug(`getUserInfos response:${JSON.stringify(user)}`)
    response.leagueImage = user.leagueImage
    response.leagueName = user.leagueName
    response.hideRank = user.hideRank
    response.pvpPoints = user.pvpPoints
    response.warPoints = user.warPoints
    response.userName = user.name
    response.userImage = user.image
    response.address = user.address
    response.Win = user.matchWon
    response.totalMatches = user.matchCount
    response.lost = user.matchCount - user.matchWon

    return response
  }
}


module.exports = { UserService };