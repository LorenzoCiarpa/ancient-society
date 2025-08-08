const {mysqlPvp} = require('../../config/databaseConfig');
const logger= require('../../logging/logger');
const {Utils} = require("../../utils/utils");

class UserQueries{
    static async getUser(address){
        logger.info(`getUser start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM user WHERE address = ?";
    
            mysqlPvp.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getUnseenNotifications(address){
        logger.info(`getUnseenNotifications start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM notification_war WHERE address = ? AND seen = 0";
    
            mysqlPvp.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getUnseenNotifications end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setNotificationSeen(address,idNotification){
        logger.info(`setNotificationSeen start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE notification_war SET seen = 1 WHERE address = ? AND idNotificationWar = ?";
    
            mysqlPvp.query(sql, [address,idNotification], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setNotificationSeen end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getUserInfos(address){
        logger.info(`getUserInfos start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT l.name as leagueName , l.image as leagueImage ,u.* 
            FROM user u
            LEFT JOIN league l ON u.idLeague=l.idLeague
            WHERE address = ?
            `;
    
            mysqlPvp.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getUserInfos end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  createUser(address, userData){
        logger.info(`createUser start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT IGNORE INTO user (address, name, pvpPoints, warPoints, image) values (?,?,0,0,'https://ancient-society.s3.eu-central-1.amazonaws.com/placeholder/no-image.webp?1675307114024')";
    
            mysqlPvp.query(sql, [address, userData.nickname], (err, rows) => {
                console.log(rows)
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  createProfile(address){
        logger.info(`createProfile start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT IGNORE INTO profile (address) values (?)";
    
            mysqlPvp.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createProfile end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  retrieveLeaderboard(){
        logger.debug(`retrieveLeaderboard start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM leaderboard";

            mysqlPvp.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`retrieveLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getResources(address){
        logger.info('getResources start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT pvpPoints FROM user WHERE address = ?";

            mysqlPvp.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getResources end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async setResources(address, resources){
        logger.info(`setResources start`);

        return new Promise((resolve, reject) => {
            let sql = "UPDATE user SET pvpPoints = ? WHERE address = ?";

            mysqlPvp.query(sql, [resources.resources.pvpPoints, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setResources end`);
                    return resolve(rows);
                }
            });
        });
    }
    
    static async subResources(address, pvpPoints) {
        logger.info(`subResources start`);
        logger.debug(`address: ${address}, pvpPoints: ${pvpPoints}`)
        
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    user
                SET
                    pvpPoints = IF(pvpPoints >= ?, pvpPoints - ?, pvpPoints)
                WHERE
                    address = ?
                `;

            mysqlPvp.query(sql, [pvpPoints, pvpPoints, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subResources end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subAncien(address, ancien){
        logger.info(`subAncien start`);
        logger.debug(`address: ${address}, ancien: ${ancien}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE user
            SET ancien = CASE WHEN (ancien >= ?) THEN ancien - ? ELSE ancien END
            WHERE address = ?`;

            mysqlPvp.query(sql, [ancien, ancien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subAncien end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subWood(address, wood){
        logger.info(`subWood start`);
        logger.debug(`address: ${address}, wood: ${wood}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE user
            SET wood = CASE WHEN (wood >= ?) THEN wood - ? ELSE wood END
            WHERE address = ?`;

            mysqlPvp.query(sql, [wood, wood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subWood end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subStone(address, stone){
        logger.info(`subStone start`);
        logger.debug(`address: ${address}, stone: ${stone}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE user
            SET stone = CASE WHEN (stone >= ?) THEN stone - ? ELSE stone END
            WHERE address = ?`;

            mysqlPvp.query(sql, [stone, stone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subStone end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addAncien(address, newAncien){
        logger.info(`addAncien start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE user SET ancien = ancien + ? WHERE address = ?";

            mysqlPvp.query(sql, [newAncien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async addWood(address, newWood){
        logger.info(`addWood start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE user SET wood = wood + ? WHERE address = ?";

            mysqlPvp.query(sql, [newWood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async addStone(address, newStone){
        logger.info(`addStone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE user SET stone = stone + ? WHERE address = ?";

            mysqlPvp.query(sql, [newStone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async setResourceTransfer(transferObject){
        logger.info(`setResourceTransfer start`);
        return new Promise((resolve, reject) => {
            let sql;
            let params = [
                transferObject.sender,
                transferObject.receiver,
                transferObject.type,
                transferObject.quantity,
                transferObject.senderBalanceBefore,
                transferObject.senderBalanceAfter,
                transferObject.receiverBalanceBefore,
                transferObject.receiverBalanceAfter
            ]
            
            sql = `
            INSERT INTO resource_transfer (
                sender, 
                receiver, 
                type, 
                quantity, 
                senderBalanceBefore, 
                senderBalanceAfter, 
                receiverBalanceBefore, 
                receiverBalanceAfter,
                transferTime
            ) VALUES (?,?,?,?,?,?,?,?, current_timestamp)`;
            
    
            mysqlPvp.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setResourceTransfer end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    
    static async setResourceAfterClaim(address, newAmount, resource){
        logger.debug("setResourceAfterClaim start");
        return new Promise((resolve, reject) => {
            let secondSql = "UPDATE user SET " + resource + " = ? WHERE address = ?";
            mysqlPvp.query(secondSql, [newAmount, address], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("setResourceAfterClaim end");
                    resolve(rows);
                }
            });
        });
    }

    static async setClaimTransfer(transferObject){
        logger.info(`setClaimTransfer start`);
        return new Promise((resolve, reject) => {
            let sql;
            let params = [
                transferObject.idBuilding,
                transferObject.typeBuilding,
                transferObject.address,
                transferObject.resourceBefore,
                transferObject.resourceAfter,
                transferObject.resourceBalanceBefore,
                transferObject.resourceBalanceAfter
            ]
            
            sql = `
            INSERT INTO claim_history_transfer (
                idBuilding, 
                typeBuilding, 
                address,
                resourceBefore,
                resourceAfter,
                resourceBalanceBefore, 
                resourceBalanceAfter,
                transferTime
            ) VALUES (?,?,?,?,?,?,?, current_timestamp)`;
            
    
            mysqlPvp.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setClaimTransfer end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkLastBurnIsGreaterThan(address, resourceType, min){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM burn
            WHERE timestampdiff(second, burnTime, current_timestamp) < 86400  
            AND id = (
                SELECT id 
                FROM burn 
                WHERE address = ?
                AND type = ? 
                AND quantity >= ? 
                ORDER BY id DESC 
                LIMIT 1
            )
            `;

            mysqlPvp.query(sql, [address, resourceType, min], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async getLastBurnGreaterThan(address, resourceType, min){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM burn
            WHERE address = ?
            AND type = ? 
            AND quantity >= ? 
            ORDER BY id DESC 
            LIMIT 1
            `;

            mysqlPvp.query(sql, [address, resourceType, min], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

}

module.exports = {UserQueries};