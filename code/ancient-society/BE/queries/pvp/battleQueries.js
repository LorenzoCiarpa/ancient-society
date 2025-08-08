const { mysql } = require('../../config/databaseConfig');
const { mysqlPvp } = require('../../config/databaseConfig');
const { add } = require('../../logging/logger');
const logger = require('../../logging/logger');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig')
const { selectFromDB } = require('../../utils/selectFromDB')

class BattleQueries {
    static async getAffix(affixId) {
        //logger.info(`getAffix start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    affix
                WHERE
                    idAffix = ?
            `;

            mysqlPvp.query(sql, [affixId], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    //logger.info(`getAffix end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getWarHistory(idWar) {
        logger.info(`getWarHistory start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                warHistory.*, a.image
                FROM 
                    warHistory
                LEFT JOIN
                    war w
                    ON w.idWar = warHistory.idWar
                LEFT JOIN
                    arena a
                    ON w.idArena = a.idArena
                WHERE
                warHistory.idWar = ?
            `;

            mysqlPvp.query(sql, [idWar], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getWarHistory end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getAllAffixes() {
        logger.info(`getgetAllAffixes start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    affix
            `;

            mysqlPvp.query(sql, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getAllAffixes end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAffixes(affixId1,affixId2,affixId3) {
        logger.info(`getAffixes start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    affix
                WHERE
                    idAffix = ?
                OR idAffix = ?
                OR idAffix = ?
            `;

            mysqlPvp.query(sql, [affixId1,affixId2,affixId3], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getAffixes end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTurnsInfo(idWar) {
        logger.info(`getTurnsInfo start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    battle
                WHERE
                    idWar = ?
            `;

            mysqlPvp.query(sql, [idWar], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getTurnsInfo end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getActiveWars() {
        logger.info(`getActiveWars start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT w.idWar 
            from war w 
            WHERE w.winner IS NULL 
            AND ((SELECT COUNT(*) FROM battle b2 where b2.idWar=w.idWar) >4) 
            `;

            mysqlPvp.query(sql,(err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getActiveWars end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTurnsInfoGivenAddressAndIdWar(idWar,address) {
        logger.info(`getTurnsInfoGivenAddressAndIdWar start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    battle
                WHERE
                    idWar = ?
                    AND address = ?
            `;

            mysqlPvp.query(sql, [idWar,address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getTurnsInfoGivenAddressAndIdWar end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getNextLeauge(idLeague) {
        logger.info(`getNextLeauge start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    league
                WHERE
                    idLeague = ?
            `;

            mysqlPvp.query(sql, [idLeague+1], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getNextLeauge end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getLeauge(idLeague) {
        logger.info(`getPrevLeauge start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    league
                WHERE
                    idLeague = ?
            `;

            mysqlPvp.query(sql, [idLeague], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getPrevLeauge end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTrophiesFromAddress(address) {
        logger.info(`getTrophiesFromAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    user
                WHERE
                    address = ?
            `;

            mysqlPvp.query(sql, [address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getTrophiesFromAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateHistory(idWar,storage,winner,newTrophiesWinner,oldTrophiesWinner,newTrophiesLoser,oldTrophiesLoser) {
        logger.info(`updateHistory start`);
        return new Promise((resolve, reject) => {
            let sql=`
            INSERT INTO warHistory (idWar,turn1,turn2,turn3,winner1,winner2,winner3,oldTrophiesWinner,newTrophiesWinner,oldTrophiesLoser,newTrophiesLoser) VALUES(?,?,?,?,?,?,?,?,?,?,?)
            `
            mysqlPvp.query(sql, [idWar,storage.turn1,storage.turn2,storage.turn3,winner[0],winner[1],winner[2],oldTrophiesWinner,newTrophiesWinner,oldTrophiesLoser,newTrophiesLoser], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateHistory end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setWarWinner(idWar,winner) {
        logger.info(`setWarWinner start`);
        return new Promise((resolve, reject) => {
            let sql=`
            UPDATE  war SET winner = ?,endingTime=current_timestamp where idWar = ?
            `
            mysqlPvp.query(sql, [winner,idWar], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setWarWinner end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getActiveWarInfoFromAddressAndIdWar(address,idWar) {
        logger.info(`getTurnsInfo start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    battle
                WHERE
                    idWar = ?
                AND address = ?
            `;

            mysqlPvp.query(sql, [idWar,address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getTurnsInfo end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAffixGivenTurnAndIdWar(address,idWar,turn) {
        logger.info(`getAffixGivenTurnAndIdWar start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    affixIds
                FROM 
                    battle
                WHERE
                    idWar = ?
                AND turn = ?
                AND address = ?
            `;

            mysqlPvp.query(sql, [idWar,turn,address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getAffixGivenTurnAndIdWar end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAffixHistoryGivenIdWar(idWar) {
        logger.info(`getAffixHistoryGivenIdWar start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    affixHistory
                WHERE
                    idWar = ?
            `;

            mysqlPvp.query(sql, [idWar], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getAffixHistoryGivenIdWar end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getLegendaryCard(legendaryId) {
        logger.info(`getAffix start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    card_instance ci
                LEFT JOIN card_level cl ON cl.idCardLevel = ci.idCardLevel
                WHERE
                    idCardInstance = ?
            `;

            mysqlPvp.query(sql, [legendaryId], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getAffix end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getCardInstanceInfo(idCardInstance) {
        //logger.info(`getCardInstanceInfo start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                    c.name,c.idCard ,c.category,c.rarity,c.image,
					cl.\`level\`,cl.hp,cl.attack,cl.speed,cl.\`range\`,
                    ci.idCardInstance,
                    weapon.idGearInstance as weapon , shield.idGearInstance as shield, talisman.idGearInstance as talisman,
                    weaponLevel.percentageBuff as weaponPerc,weaponLevel.flatBuff as weaponFlat,
                    shieldLevel.percentageBuff as shieldPerc,shieldLevel.flatBuff as shieldFlat,
                    talismanLevel.buffAttribute as talismanType,talismanLevel.percentageBuff as talismanPerc,talismanLevel.flatBuff as talismanFlat
                    FROM 
                    card_instance ci
                LEFT JOIN card c ON ci.idCard = c.idCard  
                LEFT JOIN card_level cl ON cl.idCardLevel=ci.idCardLevel
                LEFT JOIN gear_instance weapon ON ci.weaponSlot = weapon.idGearInstance
                LEFT JOIN gear_level weaponLevel ON weapon.idGearLevel=weaponLevel.idGearLevel
                LEFT JOIN gear_instance shield ON ci.shieldSlot = shield.idGearInstance
                LEFT JOIN gear_level shieldLevel ON shield.idGearLevel=shieldLevel.idGearLevel
                LEFT JOIN gear_instance talisman ON ci.talismanSlot = talisman.idGearInstance
                LEFT JOIN gear_level talismanLevel ON talisman.idGearLevel=talismanLevel.idGearLevel
                WHERE
                    idCardInstance = ?

            `;

            mysqlPvp.query(sql, [idCardInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    //logger.info(`getCardInstanceInfo end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }



}

module.exports = {BattleQueries}