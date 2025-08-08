const { mysqlPvp } = require('../../../config/databaseConfig');
const {mysql} = require('../../../config/databaseConfig');
const logger = require('../../../logging/logger');
const {Utils} = require("../../../utils/utils");

class CardQueries {
    static async checkIfUserHasCard(address, idCard) {
        logger.debug(`checkIfUserHasCard start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardInstance
                FROM
                    card_instance 
                WHERE
                    address = ? 
                    AND idCard = ?    
            `
            mysqlPvp.query(sql, [address, idCard], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfUserHasCard end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getIdCardInstance(address, idCard) {
        logger.debug(`getIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardInstance 
                FROM
                    card_instance 
                WHERE
                    address = ? 
                    AND idCard = ?
                `

            mysqlPvp.query(sql, [address, idCard], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async createCardInstanceByAddressIdCardQuantity(address, idCard, quantity) {
        logger.debug(`createCardInstanceByAddressIdCardQuantity start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    card_instance (address, idCard, idCardLevel) 
                VALUES
                    (
                        ?,
                        ?,
                        (SELECT idCardLevel FROM card_level WHERE idCard=? AND level = (SELECT MIN(level) FROM card_level WHERE idCard = ?)  )
                    )
                `
            mysqlPvp.query(sql, [address, idCard, quantity, idCard,idCard], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createCardInstanceByAddressIdCardQuantity end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async updateCardInstanceByIdCardInstance(idCardInstance, quantity) {
        logger.debug(`updateCardInstanceByIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    card_instance 
                SET
                    quantity = quantity + ? 
                WHERE
                    idCardInstance = ?
                `
            mysqlPvp.query(sql, [quantity, idCardInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateCardInstanceByIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getQuantityByIdCardInstance(idCardInstance) {
        logger.info(`getQuantityByIdCardInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity
                FROM
                    card_instance
                WHERE
                    idCardInstance = ?
            `;

            mysqlPvp.query(sql, idCardInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getQuantityByIdCardInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateCardInstance(idCardInstance, quantity) {
        logger.debug(`updateCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    card_instance
                SET
                    quantity = ?
                WHERE
                    idCardInstance = ?
                `

            mysqlPvp.query(sql, [quantity, idCardInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkIfUserHasIdCard(address, idCard, quantity) {
        logger.debug(`checkIfUserHasIdCard start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardInstance,
                    quantity + ? AS expectedQuantity 
                FROM
                    card_instance 
                WHERE
                    address = ? 
                    AND idCard = ?
                `

            mysqlPvp.query(sql, [quantity, address, idCard], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkIfUserHasIdCard end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getCardQuantity(address, idCardLevel) {
        logger.info(`getCardQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idCardInstance
            FROM 
                card_instance
            WHERE
                address = ?
            AND
                idCardLevel = ?
            `;

            mysqlPvp.query(sql, [address, idCardLevel], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getCardQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async subCardByIdCardInstance(idCardInstance, quantity) {
        logger.info(`subCardByIdCardInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                card_instance
            SET
                quantity = IF(quantity >= ? , quantity - ? , quantity)
            WHERE
                idCardInstance = ?
            `;

            mysqlPvp.query(sql, [quantity, quantity, idCardInstance] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subCardByIdCardInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async checkPropertyToUpgrade(idCardInstance, address) {
        logger.info(`checkPropertyToUpgrade start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c_ins.idCard, 
                    c_lev.hp, c_lev.attack,c_lev.speed,c_lev.range, c_lev.chanceUpgrade, c_lev.level, c_lev.isUpgradable,
                    c_lev.level - 1 AS prevLevel,
                    c_lev.level + 1 AS nextLevel 
                FROM
                    card_instance AS c_ins 
                    JOIN
                        card_level AS c_lev 
                        ON c_lev.idCardLevel = c_ins.idCardLevel 
                WHERE
                    c_ins.idCardInstance = ? 
                    AND c_ins.address = ?
                `

            mysqlPvp.query(sql, [idCardInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`checkPropertyToUpgrade end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    
    static async getNextCardLevelByIdCardAndLevel(idCard,level) {
        logger.info(`getNextCardLevelByIdCardAndLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardLevel
                FROM
                    card_level 
                WHERE
                    idCard = ? 
                    AND level = ? + 1
                `
            mysqlPvp.query(sql, [idCard, level], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getNextCardLevelByIdCardAndLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getCardLevelByIdCardAndLevel(idCard, level) {
        logger.info(`getCardLevelByIdCardAndLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardLevel,
                    attack,
                    hp,
                    speed,
                    \`range\`  
                FROM
                    card_level 
                WHERE
                    idCard = ? 
                    AND level = ?
                `
            mysqlPvp.query(sql, [idCard, level], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getCardLevelByIdCardAndLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getCardGivenIdCardInstance(idCardInstance) {
        logger.info(`getCardGivenIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *  
                FROM
                    card_instance ci
                LEFT JOIN 
                    card c ON c.idCard = ci.idCard
                LEFT JOIN 
                    card_level cl ON cl.idCardLevel = ci.idCardLevel 
                WHERE
                    idCardInstance = ?
                `
            mysqlPvp.query(sql, [idCardInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getCardGivenIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkRequirementsToUpgradeByAddressAndIdCardLevel(address, idCardLevel, consumableIds) {
        logger.info(`checkRequirementsToUpgradeByAddressAndIdCardLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                IF(p_req.quantity IS NULL, 0, p_req.quantity) AS requiredPoints,
                IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                i_ins.idItemInstance,
                IF(IF(p_req.quantity IS NULL, 0, p_req.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointsAllowed,
                IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                u.pvpPoints AS pointsBefore,
                i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                false AS isConsumable
            FROM
                upgrade_card_requirements AS up_req 
                JOIN
                    user AS u 
                    ON u.address = ? 
                LEFT JOIN
                    point_requirements AS p_req 
                    ON p_req.idPointRequirement = up_req.idPointRequirement 
                LEFT JOIN
                    item_requirements AS i_req 
                    ON i_req.idItemRequirement = up_req.idItemRequirement 
                LEFT JOIN
                    item_instance AS i_ins 
                    ON i_ins.address = u.address
                    AND i_ins.idItem = i_req.idItem 
            WHERE
                up_req.idCardLevel = ?

                `, params = [address, idCardLevel]
            if (consumableIds[0] != null) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredPoints,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS isPointsAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS pointsBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                        true AS isConsumable
                    FROM
                        item_consumable AS i_con 
                        JOIN
                            item AS i 
                            ON i.idItem = i_con.idItem 
                        LEFT JOIN
                            item_instance AS i_ins 
                            ON i_ins.idItem = i.idItem 
                            AND i_ins.address = ? 
                    WHERE
                        i_con.idItemConsumable = ?
                    `
                params.push(address, consumableIds[0])
            }
            if (consumableIds[1] != null) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredPoints,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS isPointsAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS pointsBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                        true AS isConsumable
                    FROM
                        item_consumable AS i_con 
                        JOIN
                            item AS i 
                            ON i.idItem = i_con.idItem 
                        LEFT JOIN
                            item_instance AS i_ins 
                            ON i_ins.idItem = i.idItem 
                            AND i_ins.address = ? 
                    WHERE
                        i_con.idItemConsumable = ?
                    `
                params.push(address, consumableIds[1])
            }
            if (consumableIds[2] != null) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredPoints,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS ispointsAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS pointsBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                        true AS isConsumable
                    FROM
                        item_consumable AS i_con 
                        JOIN
                            item AS i 
                            ON i.idItem = i_con.idItem 
                        LEFT JOIN
                            item_instance AS i_ins 
                            ON i_ins.idItem = i.idItem 
                            AND i_ins.address = ? 
                    WHERE
                        i_con.idItemConsumable = ?
                    `
                params.push(address, consumableIds[2])
            }

            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`checkRequirementsToUpgradeByAddressAndIdCardLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async upgradeCardByIdCardInstance(idCardInstance, idCardLevel) {
        logger.info(`upgradeCardByIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    card_instance 
                SET
                    idCardLevel = ?
                WHERE
                    idCardInstance = ?
                `

                mysqlPvp.query(sql, [idCardLevel,idCardInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`upgradeCardByIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async downgradeCardByIdCardInstance(idCardInstance, idCardLevel) {
        logger.info(`downgradeCardByIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    card_instance 
                SET
                    idCardLevel = ? 
                WHERE
                    idCardInstance = ?
                `

                mysqlPvp.query(sql, [idCardLevel, idCardInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`downgradeCardByIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

}

module.exports = {CardQueries}