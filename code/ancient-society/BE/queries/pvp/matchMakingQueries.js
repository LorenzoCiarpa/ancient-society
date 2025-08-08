const { mysql } = require('../../config/databaseConfig');
const { mysqlPvp } = require('../../config/databaseConfig');
const { add } = require('../../logging/logger');
const logger = require('../../logging/logger');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig')
const { selectFromDB } = require('../../utils/selectFromDB');





class MatchMakingQueries {
    static async checkQueue(address){
        logger.info('checkQueue start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM queueMatchmaking WHERE address = ?";

            mysqlPvp.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('checkQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateMatchCount(address1,address2){
        logger.info('updateMatchCount start');

        return new Promise((resolve, reject) => {
            let sql = "UPDATE `user` u SET matchCount = matchCount + 1 where address = ? OR address = ? "

            mysqlPvp.query(sql, [address1,address2], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('updateMatchCount end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateWinner(address,newTrophies,pointsToAdd,promo){
        logger.info('updateWinner start');

        return new Promise((resolve, reject) => {
            let sql
            if(promo)
                sql = 'UPDATE `user` u SET matchWon = matchWon + 1, warPoints = ? , pvpPoints = pvpPoints + ? , dailyReward = dailyReward + ?, idLeague = idLeague + 1 where address = ?'
            else sql = 'UPDATE `user` u SET matchWon = matchWon + 1, warPoints = ? , pvpPoints = pvpPoints + ? , dailyReward = dailyReward + ? where address = ?'

            mysqlPvp.query(sql, [newTrophies,pointsToAdd,pointsToAdd,address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('updateWinner end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateUserTrophiesAndReward(address,newTrophies,pointsToAdd,demote){
        logger.info('updateUserTrophies start');

        return new Promise((resolve, reject) => {
            let sql
            if(demote)
                sql = 'UPDATE `user` u SET warPoints = ? , pvpPoints = pvpPoints + ? , dailyReward = dailyReward + ?, idLeague = idLeague - 1 where address = ?'
            else sql = 'UPDATE `user` u SET warPoints = ? , pvpPoints = pvpPoints + ? , dailyReward = dailyReward + ?  where address = ?'

            mysqlPvp.query(sql, [newTrophies,pointsToAdd,pointsToAdd,address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('updateUserTrophies end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getQueue(address){
        logger.info('getQueue start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM queueMatchmaking WHERE address != ? ORDER BY joinTime";

            mysqlPvp.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getWholeQueue(){
        logger.info('getWholeQueue start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT *,TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP(), joinTime)) as timeInQueue FROM queueMatchmaking";

            mysqlPvp.query(sql,  (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getWholeQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAllAffixes(){
        logger.info('getAllAffixes start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM affix";

            mysqlPvp.query(sql,  (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getAllAffixes end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateRangeQueue(address,newRange){
        logger.info('updateRangeQueue start');

        return new Promise((resolve, reject) => {
            let sql = "UPDATE queueMatchmaking SET \`range\` = ? WHERE address = ?";

            mysqlPvp.query(sql, [newRange,address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('updateRangeQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkWar(address){
        logger.info('checkWar start');

        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM war WHERE (address1 = ? OR address2 = ?) AND ISNULL(winner) ORDER BY idWar DESC`;

            mysqlPvp.query(sql, [address,address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('checkWar end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getWarsToFix(){
        logger.info('getWarsToFix start');

        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM war WHERE ISNUL(idArena)`;

            mysqlPvp.query(sql, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getWarsToFix end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async insertArenaGivenIdWar(idArena,idWar){
        logger.info('insertArenaGivenIdWar start');

        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO war (idArena) VALUES (?) WHERE idWar = ?`;

            mysqlPvp.query(sql, [idArena,idWar],(err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('insertArenaGivenIdWar end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async insertInWar(address1,address2,idArena){
        logger.info('insertInWar start');

        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO war (address1,address2,idArena) VALUES (?,?,?)";

            mysqlPvp.query(sql, [address1,address2,idArena], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('insertInWar end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async insertAffixes(affixes,idWar){
        logger.info('insertAffixes start');
        
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO affixHistory (turn1,turn2,turn3,idWar) VALUES (?,?,?,?)";

            mysqlPvp.query(sql, [affixes.turn1,affixes.turn2,affixes.turn3,idWar], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('insertAffixes end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async insertInQueue(address,trophies){
        logger.info('insertInQueue start');

        return new Promise((resolve, reject) => {
            let sql = "INSERT IGNORE INTO queueMatchmaking (address,joinTime,trophies,\`range\`) VALUES (?,current_timestamp(),?,?)";

            mysqlPvp.query(sql, [address,trophies,serverConfig.matchmaking.DEFAULT_RANGE], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('insertInQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async removeFromQueue(address){
        logger.info('removeFromQueue start');

        return new Promise((resolve, reject) => {
            let sql = "DELETE FROM queueMatchmaking  WHERE address = ?";

            mysqlPvp.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('removeFromQueue end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAllArenas(){
        logger.info('getAllArenas start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM arena ";

            mysqlPvp.query(sql, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getAllArenas end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async callMatchMakingRoutine(){
        logger.info('callMatchMakingRoutine start');

        return new Promise((resolve, reject) => {
            let sql = "call matchmakingRoutine (?,?,?,?,?,?);";

            mysqlPvp.query(sql,[serverConfig.matchmaking.TIME1,serverConfig.matchmaking.TIME2,serverConfig.matchmaking.TIME3,serverConfig.matchmaking.RANGE1,serverConfig.matchmaking.RANGE2,serverConfig.matchmaking.RANGE3], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('callMatchMakingRoutine end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports = {MatchMakingQueries}