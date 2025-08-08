const logger = require('../logging/logger')
const {mysql} = require('../config/databaseConfig')
const { Utils } = require("../utils/utils");

class DevQueries {

    static async getAllOwners(idItem) {
        logger.debug('getAllOwners query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    quantity,address
                FROM 
                    item_instance
                WHERE 
                    idItem = ?
                `

            mysql.query(sql, [idItem], (err, rows) => {
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
                    logger.debug('getAllOwners query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async insertWinners(winners) {
        logger.debug('insertWinners query start')

        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO challange_whitelist (address)
            VALUES `
            for(let i=0;i<winners.length;i++){
                sql+=`(${winners[i]})\n`
                if(i!=winners.length-1) sql+=`,`
            }

            mysql.query(sql, [], (err, rows) => {
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
                    logger.debug('insertWinners query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

}

module.exports = { DevQueries }