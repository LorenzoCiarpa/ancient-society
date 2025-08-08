const logger = require('../logging/logger')
const { mysql } = require('../config/databaseConfig')
const { Utils } = require("../utils/utils");

class ColonyQueries {
  static async checkIfNftExists(address, idBuilding, type) {
    logger.debug('checkIfNftExists query start')

    return new Promise((resolve, reject) => {
      let sql = `
          SELECT *
          FROM buildings
          WHERE address = ?
          AND idBuilding = ?
          AND type = ?
          AND stake = FALSE
        `

      mysql.query(sql, [address, idBuilding, type], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('checkIfNftExists query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async checkIfColonyExists(address, idColony) {
    logger.debug('checkIfColonyExists query start')

    return new Promise((resolve, reject) => {
      let sql = `
          SELECT * FROM colony
          WHERE mainCity = ?
          AND colonyIndex = ?
        `

      mysql.query(sql, [address, idColony], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('checkIfColonyExists query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async transferNftToColony(address, nft, idColony) {
    logger.debug('transferNftToColony query start')

    return new Promise((resolve, reject) => {
      let sql = `
          UPDATE buildings
          SET address = CONCAT(CONCAT(?, '_'), ?)
          WHERE id = ?
          AND address = ?
        `

      mysql.query(sql, [address, idColony, nft.id, address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('transferNftToColony query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async transferBasicToolToColony(address, nft, idColony) {
    logger.debug('transferBasicToolToColony query start')

    return new Promise((resolve, reject) => {
      let sql = `
          UPDATE tool_instance
          SET address = CONCAT(CONCAT(?, '_'), ?)
          WHERE idToolInstance = ?
          AND address = ?
        `

      mysql.query(sql, [address, idColony, nft.idBasicTool, address, nft.id], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('transferBasicToolToColony query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async transferNftToMain(address, nft) {
    logger.debug('transferNftToMain query start')

    return new Promise((resolve, reject) => {
      let sql = `
          UPDATE buildings
          SET address = ?
          WHERE id = ?
        `

      mysql.query(sql, [address, nft.id], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('transferNftToMain query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async transferBasicToolToMain(address, nft) {
    logger.debug('transferBasicToolToMain query start')

    return new Promise((resolve, reject) => {
      let sql = `
          UPDATE tool_instance
          SET address = ?
          WHERE idToolInstance = ?
        `

      mysql.query(sql, [address, nft.idBasicTool], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('transferBasicToolToMain query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async addColony(address,) {
    logger.debug('addColony query start')

    return new Promise((resolve, reject) => {
      let sql = `
            START TRANSACTION;
                SET @colony_index = (SELECT IF (MAX(colonyIndex), MAX(colonyIndex), 0) + 1 AS maxColonyIndex FROM colony WHERE mainCity = ?
                );

                INSERT INTO utente
                    (address, ancien, wood, stone)
                VALUES
                    (CONCAT(CONCAT(?, '_'), @colony_index), 0, 0, 0);

                INSERT INTO profile
                    (address, cityName)    
                VALUES
                    (CONCAT(CONCAT(?, '_'), @colony_index), CONCAT(?, '#', @colony_index));
                
                INSERT INTO colony
                    (mainCity, colonyCity, colonyIndex)
                VALUES
                    (?, CONCAT(CONCAT(?, '_'), @colony_index), @colony_index);
                
                SELECT idColony, mainCity, colonyCity, colonyIndex 
                FROM colony
                WHERE mainCity = ? 
                AND colonyIndex = @colony_index;

                COMMIT;
        
                `

      mysql.query(sql, [address, address, address, address, address, address, address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('addColony query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async checkIfColonyLimited(address) {
    logger.debug('checkIfColonyLimited query start')

    return new Promise((resolve, reject) => {
      let sql = `
                SELECT
                    count(*) as counter
                FROM
                    colony 
                WHERE
                    mainCity = ? 
                `

      mysql.query(sql, [address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('checkIfColonyLimited query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async checkIfUserExists(address) {
    logger.debug('checkIfUserExists query start')

    return new Promise((resolve, reject) => {
      let sql = `
                SELECT
                    address 
                FROM
                    utente 
                WHERE
                    address = ?
                `

      mysql.query(sql, [address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('checkIfUserExists query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async getColonies(address) {
    logger.debug('getColonies query start')

    return new Promise((resolve, reject) => {
      let sql = `
                SELECT
                    c.*,
                    IF(p.id IS NULL OR p.cityName IS NULL, c.colonyCity , p.cityName) AS disColony
                FROM
                    colony AS c
                    LEFT JOIN
                        profile AS p 
                        ON p.address = c.colonyCity 
                WHERE
                    c.mainCity = ?
                ORDER BY
                    colonyIndex ASC
                `

      mysql.query(sql, [address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('getColonies query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }

  static async getColonyByIdColonyAndAddress(idColony, address) {
    logger.debug('getColonyByIdColonyAndAddress query start')

    return new Promise((resolve, reject) => {
      let sql = `
                SELECT
                    *
                FROM
                    colony AS c
                WHERE
                    c.idColony = ?
                AND
                    c.mainCity = ?
                `

      mysql.query(sql, [idColony, address], (err, rows) => {
        if (err) {
          logger.error(`query error: ${Utils.printErrorLog(err)}`)
          return reject(new Error(err.message))
        }
        if (rows == undefined || rows == null) {
          logger.error(`query error: no result`)
          return reject({
            message: "undefined"
          })
        } else {
          logger.debug('getColonyByIdColonyAndAddress query end')
        }
        return (resolve(JSON.parse(JSON.stringify(rows))))
      })
    })
  }
}

module.exports = { ColonyQueries }