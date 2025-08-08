const {mysql} = require('../config/databaseConfig');
const { serverConfig } = require('../config/serverConfig');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");

class MinerQueries {
    static async checkIfValidPassiveBuilding(pkBuilding) {
        logger.debug(`checkIfValidPassiveBuilding START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.level,
                    pas.idPassive,
                    pas.isPassive 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        passive AS pas 
                        ON pas.idPassive = bud.idPassive 
                WHERE
                    bud.id = ?
                `
            mysql.query(sql, [pkBuilding], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfValidPassiveBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async checkMiner(address) {
        logger.debug(`checkMiner START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.id AS idMiner, bud.level, bud.stake, bud.upgradeStatus, bud.idToolInstance,
                    mn.miningEndingTime,
                    IF ( t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasToolInstance, t.rarity,
                    IF ( mn.idMining IS NOT NULL, TRUE, FALSE) AS nowMining 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                        AND t_ins.address = ? 
                    LEFT JOIN tool AS t
                        ON t.idTool = t_ins.idTool
                    LEFT JOIN
                        mining AS mn 
                        ON (mn.idToolInstance = bud.idToolInstance OR mn.idMiner = bud.id) 
                        AND status = 1 
                WHERE
                    bud.address = ? 
                    AND bud.type = 5
                ORDER BY
					stake DESC
                `
            mysql.query(sql, [address, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkMiner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeEquippedTool(idMiner) {
        logger.debug(`removeEquippedTool START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    buildings 
                SET
                    idToolInstance = NULL 
                WHERE
                    id = ?
                `
            mysql.query(sql, idMiner, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`removeEquippedTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async isAlwaysCave(idCave) {
        logger.debug(`isAlwaysCave START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT always FROM cave WHERE idCave = ?
                `
            mysql.query(sql, [idCave], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`isAlwaysCave END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].always)
                }
            })
        })
    }
    static async getSpecialRequirements(address, idCave) {
        logger.debug(`getSpecialRequirements START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i_req.burn,
                    i_req.quantityItem AS quantity,
                    IF(i_ins.idItemInstance IS NULL, FALSE, TRUE) AS hasInstance,
                    i_ins.idItemInstance AS idInventoryInstance,
                    'item' AS type 
                FROM
                    cave_hidden_item_requirements AS cave_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = cave_hir.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i_req.idItem 
                        AND i_ins.address = ? 
                        AND i_ins.quantity >= i_req.quantityItem 
                WHERE
                    cave_hir.idCave = ? 
                UNION
                SELECT
                    t_req.burn,
                    1 AS quantity,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasInstance,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    cave_hidden_tool_requirements AS cave_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = cave_htr.idToolRequirement 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolLevel = t_req.idToolLevel 
                        AND t_ins.address = ? 
                WHERE
                    cave_htr.idCave = ?
                `
            mysql.query(sql, [address, idCave, address, idCave], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getSpecialRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getAllowedSpecialCaves(address) {
        logger.debug(`getAllowedSpecialCaves START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    cave_hir.idCave AS id,
                    i_req.burn, i_req.quantityItem AS quantity,
                    i.name, i.description, i.image, 1 AS level,
                    i_ins.idItemInstance AS idInventoryInstance,
                    'item' AS type 
                FROM
                    cave_hidden_item_requirements AS cave_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = cave_hir.idItemRequirement 
                    JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                    JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i_req.idItem 
                        AND i_ins.address = ? 
                        AND i_ins.quantity >= i_req.quantityItem 
                UNION
                SELECT
                    cave_htr.idCave AS id,
                    t_req.burn, 1 AS quantity,
                    t.name, t.description, t.image, t_lev.level,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    cave_hidden_tool_requirements AS cave_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = cave_htr.idToolRequirement 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_req.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_lev.idTool 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolLevel = t_req.idToolLevel 
                        AND t_ins.equipped = TRUE 
                        AND t_ins.address = ?
                `
            mysql.query(sql, [address, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getAllowedSpecialCaves END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getCaves() {
        logger.debug(`getCaves START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                cave.idCave AS id, cave.always, cave.name AS title, cave.description, cave.rarityRequired,
                i.name AS itemName, i.description AS itemDescription, i.image AS itemImage, i.rarity AS itemRarity,
                'item' AS type
                FROM cave 
                
                JOIN cave_item AS s_i 
                ON s_i.idCave = cave.idCave 
                
                JOIN item AS i 
                ON i.idItem = s_i.idItem
                
                UNION 
                SELECT
                cave.idCave AS id, cave.always, cave.name AS title, cave.description, cave.rarityRequired,
                r.name AS itemName, r.description AS itemDescription, r.image AS itemImage, r.rarity AS itemRarity,
                'recipe' AS type
                
                FROM cave 
                
                JOIN cave_recipe AS s_r
                ON s_r.idCave = cave.idCave 
                
                JOIN recipe AS r 
                ON r.idRecipe = s_r.idRecipe
                
                ORDER BY id, itemRarity ASC, type ASC
                `
            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getCaves END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getAxes(address) {
        logger.debug(`getAxes START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.idToolInstance AS id, t_ins.equipped, t_ins.durability,
                    t_lev.level,
                    t.name, t.image, t.rarity,
                    IF(fs.idMining IS NULL, FALSE, TRUE) AS isMining,
                    fs.miningEndingTime AS axeEndingTime 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    LEFT JOIN
                        mining AS fs 
                        ON fs.idToolInstance = t_ins.idToolInstance 
                        AND status = 1 
                WHERE
                    t_ins.address = ? 
                    AND t.type = 'axe'
                `
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getAxes END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async unEquipAxe(buildingId) {
        logger.debug(`unEquipAxe START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE buildings
                SET idToolInstance = NULL
                WHERE id = ?
                `
            mysql.query(sql, buildingId, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`unEquipAxe END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async unEquipTool(idToolInstance) {
        logger.debug(`unEquipTool START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE tool_instance
                SET equipped = FALSE, pkBuilding = NULL
                WHERE idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`unEquipTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }














    static async getTool(address) {
        logger.debug(`getTool [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM tool_instance JOIN tool_level ON tool_instance.idToolLevel = tool_level.idToolLevel JOIN tool ON tool_instance.idTool = tool.idTool WHERE address = ? AND type = ?";
            mysql.query(sql, [address, 'axe'], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getTool [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryMiner(address) {
        logger.debug(`getQueryMiner [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE type = 5 AND stake = 1 AND address = ?";
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryMiner [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryCave() {
        logger.debug(`getQueryCave [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT cave.*, item.name, item.image, item.rarity 
                FROM cave 
                JOIN cave_item ON cave.idCave = cave_item.idCave
                JOIN item ON cave_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryCave [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryEquippedTool(address) {
        logger.debug(`getQueryEquippedTool [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT * 
                FROM   tool JOIN tool_instance on tool.idTool = tool_instance.idTool 
                WHERE  tool_instance.equipped = true AND tool.type = ? AND tool_instance.address = ?`;
            mysql.query(sql, ['axe', address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryEquippedTool [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryCaveItem() {
        logger.debug(`getQueryCaveItem [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT cave_item.idCave, item.name, item.image, item.rarity, item.description 
                FROM cave_item JOIN item ON cave_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryCaveItem [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getPassiveStatus(idMiner) {
        logger.debug(`getPassiveStatus start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    isPassive 
                FROM
                    passive
                WHERE
                    pkBuilding = ?
                `;
            mysql.query(sql, idMiner, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getPassiveStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async verifyStakedMiner(address) {
        logger.debug(`verifyStakedMiner start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.id, bud.idToolInstance,
                    t_ins.idToolLevel, t_ins.idTool 
                FROM
                    buildings AS bud 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                WHERE
                    bud.type = 5 
                    AND bud.stake = 1 
                    AND bud.upgradeStatus = 0 
                    AND bud.address = ?
                `;
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`verifyStakedMiner end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async checkByCaveTool(idCave, axeIdTool) {
        logger.debug(`checkByCaveTool start`)
        return new Promise((resolve, reject) => {
            /* let sql = `
                SELECT
                    idCaveTool 
                FROM
                    cave_tool 
                WHERE
                    idCave = ? 
                    AND idTool = ?
                ` */
            let sql = `
                SELECT
                    idCaveTool 
                FROM
                    cave_tool_requirements 
                WHERE
                    idCave = ? 
                    AND idTool = ?
                `
            mysql.query(sql, [idCave, axeIdTool], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkByCaveTool end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkUsingOfBuildingAndAxe(idMiner, axeIdInstance) {
        logger.debug(`checkUsingOfBuildingAndAxe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idMining 
                FROM
                    mining 
                WHERE
                    status = 1 
                    AND 
                    (
                        idMiner = ? 
                        OR idToolInstance = ?
                    )
                    AND miningEndingTime >= current_timestamp 
                `
            mysql.query(sql, [idMiner, axeIdInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkUsingOfBuildingAndAxe end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getToolRarityGivenIdToolInstance(address, idToolInstance) {
        logger.debug(`getToolRarityGivenIdToolInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t.rarity 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                WHERE
                    idToolInstance = ? AND address = ?
                `;
            mysql.query(sql, [idToolInstance, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getToolRarityGivenIdToolInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async getRarityGivenIdCave(idCave) {
        logger.debug(`getRarityGivenIdCave start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rarityRequired 
                FROM
                    cave 
                WHERE
                    idCave = ?
                `;
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getRarityGivenIdCave end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async getConsumableRequirements(address, consumableIds) {
        logger.debug(`getConsumableRequirements start`)
        let sql = '', params = []
        if (consumableIds[0] != null) {
            sql = `
                SELECT
                    i_con.idItemConsumable, i_con.quantity AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
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
            params = [address, consumableIds[0]]
        }
        if (consumableIds[1] != null) {
            if (sql != '') {
                sql += `
                    UNION
                    `
            }
            sql += `
                SELECT
                    i_con.idItemConsumable, i_con.quantity AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
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
            if (sql != '') {
                sql += `
                    UNION
                    `
            }
            sql += `
                SELECT
                    i_con.idItemConsumable, i_con.quantity AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
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
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getConsumableRequirements end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getMineChance(idCave) {
        logger.debug(`getMineChance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    chanceItem, chanceRecipe 
                FROM
                    cave 
                WHERE
                    idCave = ?
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getMineChance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkDurability(idToolInstance, checkAmount) {
        logger.debug(`checkDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolInstance, durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ? 
                    AND 
                        (durability >= ?
                        OR 
                        durability = -1)
                `
            mysql.query(sql, [idToolInstance, checkAmount], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkDurability end ${JSON.stringify(rows)}`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getDurability(idToolInstance) {
        logger.debug(`getDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, [idToolInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getDurability end ${JSON.stringify(rows)}`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async reduceDurability(idToolInstance, reduceAmount) {
        logger.debug(`reduceDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    tool_instance 
                SET
                    durability = IF(durability >= ?, durability - ?, durability) 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, [reduceAmount, reduceAmount, idToolInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`reduceDurability end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getDurabilityByIdToolInstance(idToolInstance) {
        logger.debug(`getDurabilityByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getDurabilityByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async mineItems(idCave) {
        logger.debug(`mineItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_i.itemProbability, TRUE, FALSE) AS mined,
                    i.name, i.image, i.rarity 
                FROM
                    cave_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idCave = ?
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async mineableItems(idCave) {
        logger.debug(`mineItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop, s_i.itemProbability,
                    i.name, i.image, i.rarity 
                FROM
                    cave_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idCave = ?
                ORDER BY 
                    s_i.itemProbability ASC
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async mineRecipes(idCave) {
        logger.debug(`mineRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_r.recipeProbability, TRUE, FALSE) AS mined,
                    rec.name, rec.image,
                    t.rarity 
                FROM
                    cave_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                    JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                WHERE
                    s_r.idCave = ?
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idCave}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async mineableRecipes(idCave) {
        logger.debug(`mineRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop, s_r.recipeProbability,
                    rec.name, rec.image, rec.rarity
                FROM
                    cave_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                WHERE
                    s_r.idCave = ?
                ORDER BY 
                    s_r.recipeProbability ASC
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idCave}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async mineExp(idCave) {
        logger.debug(`mineExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    IF ( RAND(CURRENT_TIME) < probability, TRUE, FALSE) AS mined,
                    experience 
                FROM
                    cave_mine 
                WHERE
                    idCave = ?
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineExp end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async mineableMines(idCave) {
        logger.debug(`mineExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCaveMine, name, image, rarity,
                    probability,
                    experience 
                FROM
                    cave_mine 
                WHERE
                    idCave = ?
                ORDER BY 
                    probability ASC
                `
            mysql.query(sql, idCave, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`mineExp end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkIfUserHasRecipe(address, idRecipe) {
        logger.debug(`checkIfUserHasRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idRecipeInstance ,
                quantity
            FROM
                recipe_instance 
            WHERE
                address = ? 
                AND idRecipe = ?    
            `
            mysql.query(sql, [address, idRecipe], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfUserHasRecipe end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createRecipeInstanceByAddressIdRecipeQuantity(address, idRecipe, quantity) {
        logger.debug(`createRecipeInstanceByAddressIdRecipeQuantity start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    recipe_instance (address, idRecipe, quantity) 
                VALUES
                    (
                        ? , ?, ?
                    )
                `
            mysql.query(sql, [address, idRecipe, quantity], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createRecipeInstanceByAddressIdRecipeQuantity end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateRecipeInstanceByIdRecipeInstance(idRecipeInstance, quantity) {
        logger.debug(`updateRecipeInstanceByIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    recipe_instance 
                SET
                    quantity = quantity + ? 
                WHERE
                    idRecipeInstance = ?
                `
            mysql.query(sql, [quantity, idRecipeInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateRecipeInstanceByIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfUserHasItem(address, idItem) {
        logger.debug(`checkIfUserHasItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance,
                    quantity 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?    
            `
            mysql.query(sql, [address, idItem], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfUserHasItem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createItemInstanceByAddressIdItemQuantity(address, idItem, quantity) {
        logger.debug(`createItemInstanceByAddressIdItemQuantity start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    item_instance (address, idItem, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `
            mysql.query(sql, [address, idItem, quantity], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createItemInstanceByAddressIdItemQuantity end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateItemInstanceByIdItemInstance(idItemInstance, quantity) {
        logger.debug(`updateItemInstanceByIdItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = quantity + ? 
                WHERE
                    idItemInstance = ?
                `
            mysql.query(sql, [quantity, idItemInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateItemInstanceByIdItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateExpByAddress(address, minedExp) {
        logger.debug(`updateExpByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    leaderboard 
                SET
                    experience = experience + ?,
                    experienceFisherman = experienceFisherman + ?
                WHERE
                    address = ?
                `
            mysql.query(sql, [minedExp, minedExp, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateExpByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async createExpByAddress(address, minedExp) {
        logger.debug(`createExpByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO leaderboard 
                    (address, experience, experienceFisherman)
                VALUES
                    (?, ?, ?)
                `;

            mysql.query(sql, [address, minedExp, minedExp], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createExpByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async updateExpMinerByAddress(address, minedExp) {
        logger.debug(`updateExpMinerByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    leaderboard 
                SET
                    experienceMiner = IF(experienceMiner IS NULL, 0, experienceMiner) + ? 
                WHERE
                    address = ?
                `
            mysql.query(sql, [minedExp, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateExpMinerByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getIdPassiveMining() {
        logger.debug(`getIdPassiveMining start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT IF(MAX(idPassiveMining) IS NULL, 0, MAX(idPassiveMining)) + 1 AS newIdPassiveMining FROM mining`
            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getIdPassiveMining end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].newIdPassiveMining)
                }
            })
        })
    }
    static async createPassiveMining(type, address, idCave, id, quantity, idMiner, idToolLevel, idToolInstance, idPassiveMining, actionNumber, qtyBefore, qtyAfter, coolDown, idMine, quantityMine) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString().slice(0, -1)
        let endingTime = (new Date(nowTime + (serverConfig.cooldownSec.miner * 1000) * (coolDown ? 1 : 0))).toISOString().slice(0, -1)

        // let endingTime = (new Date(nowTime + (actionNumber * coolDown * 60 * 1000))).toISOString()
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    mining (idCave, idItem, quantityItem, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, idPassiveMining, quantityBefore, quantityAfter, idMine, quantityMine) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, idPassiveMining, qtyBefore, qtyAfter, idMine, quantityMine]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    mining (idCave, idRecipe, quantityRecipe, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, idPassiveMining, quantityBefore, quantityAfter, idMine, quantityMine) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, idPassiveMining, qtyBefore, qtyAfter, idMine, quantityMine]
        } else if (type == 4) { // mine
            sql = `
                INSERT INTO
                    mining (idCave, idMine, quantityMine, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, idPassiveMining) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ? 
                    )
            `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, idPassiveMining]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             mining (idCave, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, idPassiveMining) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ? 
        //             )
        //     `
        //     params = [idCave, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, idPassiveMining]
        // }
        logger.debug(`createPassiveMining start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createPassiveMining end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createMining(type, address, idCave, id, quantity, idMiner, idToolLevel, idToolInstance, firstIdConsumable, secondIdConsumable, thirdIdConsumable, reduceCoolDown, noCoolDown, qtyBefore, qtyAfter, idMine, quantityMine) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString().slice(0, -1)
        let endingTime = (new Date(nowTime + ((reduceCoolDown ? serverConfig.cooldownSec.miner * 0.8 : serverConfig.cooldownSec.miner) * (noCoolDown ? 0 : 1) * 1000))).toISOString().slice(0, -1)
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    mining (idCave, idItem, quantityItem, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable, quantityBefore, quantityAfter, idMine, quantityMine) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable, qtyBefore, qtyAfter, idMine, quantityMine]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    mining (idCave, idRecipe, quantityRecipe, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable, quantityBefore, quantityAfter, idMine, quantityMine) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable, qtyBefore, qtyAfter, idMine, quantityMine]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             mining (idCave, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ?, ?
        //             )
        //     `
        //     params = [idCave, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable]
        // } 
        else if (type == 4) { // mine
            sql = `
                INSERT INTO
                    mining (idCave, idMine, quantityMine, miningStartingTime, miningEndingTime, status, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idCave, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idMiner, firstIdConsumable, secondIdConsumable, thirdIdConsumable]
        }
        logger.debug(`createMining start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createMining end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getMiningEndingTime(address, idCave, idMiner, axeIdInstance) {
        logger.debug(`getMiningEndingTime start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    MAX(miningEndingTime) AS time 
                FROM
                    mining 
                WHERE
                    address = ? 
                    AND status = 1 
                    AND idMiner = ? 
                    AND idToolInstance = ? 
                    AND idCave = ?
                `
            mysql.query(sql, [address, idMiner, axeIdInstance, idCave], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getMiningEndingTime end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getMiningGivenIdBuilding(idBuilding) {
        logger.debug(`getMiningGivenMinerId [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM mining WHERE status = 1 AND idMiner = ? AND miningEndingTime >= current_timestamp";
            mysql.query(sql, idBuilding, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getMiningGivenMinerId [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getMiningAxeGivenidAxe(idAxe) {
        logger.debug(`getMiningAxeGivenidAxe start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM mining WHERE (idToolInstance = ? ) AND status = 1 AND miningEndingTime >= current_timestamp`
            mysql.query(sql, idAxe, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getMiningAxeGivenidAxe end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async UpdateMiningStatus() {
        logger.debug(`UpdateMiningStatus [START]`);
        return new Promise((resolve, reject) => {
            let sql = `
                update
                    mining
                set
                    status = 2,
                    miningCompleteTime = miningEndingTime
                where
                    status = 1
                    and miningEndingTime < current_timestamp
                `;

            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`UpdateMiningStatus [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    // static async UpdateMiningStatus(idAxe){
    //     logger.debug(`getMiningAxeGivenidAxe [START]`);
    //     return new Promise((resolve, reject) => {
    //         let sql = `UPDATE mining SET miningCompleteTime = CASE WHEN (miningEndingTime <= current_timestamp) THEN miningEndingTime ELSE miningCompleteTime WHERE idToolInstance = ? , 
    //         SET status = CASE WHEN (miningCompleteTime != NULL ) THEN 2 ELSE status WHERE idToolInstance = ? `
    //         mysql.query(sql, [idAxe, idAxe], (err, rows) => {
    //             if(err) return reject(err);
    //             if(rows == undefined){
    //                 logger.error(`null error`);
    //                 return reject({
    //                     message: "undefined"
    //                 });
    //             }else{
    //                 logger.debug(`getMiningAxeGivenidAxe [END]`);
    //                 return resolve(JSON.parse(JSON.stringify(rows)));
    //             }
    //         })
    //     });
    // }

    static async verifyOwnConsumablesMiner(address, consumable) {
        let sql = `
        SELECT i_ins.quantity 
        FROM item_instance as i_ins
        JOIN item_consumable as i_con
        ON i_ins.idItem = i_con.idItem
        WHERE i_ins.address = ?
        AND idItemConsumable = ?
        `;

        return new Promise((resolve, reject) => {
            mysql.query(sql, [address, consumable], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createMining end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getBonuses(idToolInstance) {
        logger.debug(`getBonuses START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            * 
            FROM
  			bonus_instance bi left join bonus b on bi.idBonus = b.idBonus 
  			left join bonus_code bc on b.idBonusCode = bc.idBonusCode 
  			where idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getBonuses END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }


}

module.exports = { MinerQueries };