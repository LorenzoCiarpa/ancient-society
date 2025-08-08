const {mysql} = require('../config/databaseConfig');
const logger= require('../logging/logger');

class SecurityQueries {

    static async banAddress(address, reason){
        logger.debug(`banAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT ignore INTO address_banned
                (address, reason)
            VALUES
                (?, ?)`;

            mysql.query(sql, [address, reason], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`banAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async banIpAddress(address, ipAddres, reason){
        logger.debug(`banIpAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT ignore INTO ipaddress_banned
                (address, ipAddress, reason)
            VALUES
                (?, ?, ?)`;

            mysql.query(sql, [address, ipAddres, reason], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`banIpAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async banJwt(address, jwt, reason){
        logger.debug(`banJwt start`);
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT ignore INTO jwt_banned
                (address, jwt, reason)
            VALUES
                (?, ?, ?)`;

            mysql.query(sql, [address, jwt, reason], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`banJwt end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async isBanAddress(address){
        logger.debug(`isBanAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM address_banned
            WHERE address = ?`;

            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`isBanAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async isBanIpAddress(ipaddress){
        logger.debug(`isBanIpAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM ipaddress_banned
            WHERE ipaddress = ?`;

            mysql.query(sql, [ipaddress], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`isBanIpAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async isBanJwt(jwt){
        logger.debug(`isBanJwt start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM jwt_banned
            WHERE jwt = ?`;

            mysql.query(sql, [jwt], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`isBanJwt end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

}

module.exports = {SecurityQueries}