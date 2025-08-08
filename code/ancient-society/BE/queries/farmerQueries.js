const { mysql } = require('../config/databaseConfig');
const { serverConfig } = require('../config/serverConfig');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");

class FarmerQueries {
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
    static async checkFarmer(address) {
        logger.debug(`checkFarmer START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.id AS idFarmer, bud.level, bud.stake, bud.upgradeStatus, bud.idToolInstance,
                    mn.farmingEndingTime,
                    IF ( t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasToolInstance, t.rarity,
                    IF ( mn.idFarming IS NOT NULL, TRUE, FALSE) AS nowFarming 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                        AND t_ins.address = ? 
                    LEFT JOIN tool AS t
                        ON t.idTool = t_ins.idTool
                    LEFT JOIN
                        farming AS mn 
                        ON (mn.idToolInstance = bud.idToolInstance OR mn.idFarmer = bud.id) 
                        AND status = 1 
                WHERE
                    bud.address = ? 
                    AND bud.type = 6
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
                    logger.debug(`checkFarmer END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeEquippedTool(idFarmer) {
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
            mysql.query(sql, idFarmer, (err, rows) => {
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
    static async isAlwaysField(idField) {
        logger.debug(`isAlwaysField START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT always FROM field WHERE idField = ?
                `
            mysql.query(sql, [idField], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`isAlwaysField END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].always)
                }
            })
        })
    }
    static async getSpecialRequirements(address, idField) {
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
                    field_hidden_item_requirements AS field_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = field_hir.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i_req.idItem 
                        AND i_ins.address = ? 
                        AND i_ins.quantity >= i_req.quantityItem 
                WHERE
                    field_hir.idField = ? 
                UNION
                SELECT
                    t_req.burn,
                    1 AS quantity,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasInstance,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    field_hidden_tool_requirements AS field_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = field_htr.idToolRequirement 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolLevel = t_req.idToolLevel 
                        AND t_ins.address = ? 
                WHERE
                    field_htr.idField = ?
                `
            mysql.query(sql, [address, idField, address, idField], (err, rows) => {
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
    static async getAllowedSpecialFields(address) {
        logger.debug(`getAllowedSpecialFields START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    field_hir.idField AS id,
                    i_req.burn, i_req.quantityItem AS quantity,
                    i.name, i.description, i.image, 1 AS level,
                    i_ins.idItemInstance AS idInventoryInstance,
                    'item' AS type 
                FROM
                    field_hidden_item_requirements AS field_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = field_hir.idItemRequirement 
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
                    field_htr.idField AS id,
                    t_req.burn, 1 AS quantity,
                    t.name, t.description, t.image, t_lev.level,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    field_hidden_tool_requirements AS field_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = field_htr.idToolRequirement 
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
                    logger.debug(`getAllowedSpecialFields END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getFields() {
        logger.debug(`getFields START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                field.idField AS id, field.always, field.name AS title, field.description, field.rarityRequired,
                i.name AS itemName, i.description AS itemDescription, i.image AS itemImage, i.rarity AS itemRarity,
                'item' AS type
                FROM field 
                
                JOIN field_item AS s_i 
                ON s_i.idField = field.idField 
                
                JOIN item AS i 
                ON i.idItem = s_i.idItem
                
                UNION 
                SELECT
                field.idField AS id, field.always, field.name AS title, field.description, field.rarityRequired,
                r.name AS itemName, r.description AS itemDescription, r.image AS itemImage, r.rarity AS itemRarity,
                'recipe' AS type
                
                FROM field 
                
                JOIN field_recipe AS s_r
                ON s_r.idField = field.idField 
                
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
                    logger.debug(`getFields END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getHoes(address) {
        logger.debug(`getHoes START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.idToolInstance AS id, t_ins.equipped, t_ins.durability,
                    t_lev.level,
                    t.name, t.image, t.rarity,
                    IF(fs.idFarming IS NULL, FALSE, TRUE) AS isFarming,
                    fs.farmingEndingTime AS hoeEndingTime 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    LEFT JOIN
                        farming AS fs 
                        ON fs.idToolInstance = t_ins.idToolInstance 
                        AND status = 1 
                WHERE
                    t_ins.address = ? 
                    AND t.type = 'hoe'
                `
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getHoes END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async unEquipHoe(buildingId) {
        logger.debug(`unEquipHoe START`);
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
                    logger.debug(`unEquipHoe END`)
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
            mysql.query(sql, [address, 'hoe'], (err, rows) => {
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

    static async getQueryFarmer(address) {
        logger.debug(`getQueryFarmer [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE type = 6 AND stake = 1 AND address = ?";
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryFarmer [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryField() {
        logger.debug(`getQueryField [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT field.*, item.name, item.image, item.rarity 
                FROM field 
                JOIN field_item ON field.idField = field_item.idField
                JOIN item ON field_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryField [END]`);
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
            mysql.query(sql, ['hoe', address], (err, rows) => {
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

    static async getQueryFieldItem() {
        logger.debug(`getQueryFieldItem [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT field_item.idField, item.name, item.image, item.rarity, item.description 
                FROM field_item JOIN item ON field_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryFieldItem [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getPassiveStatus(idFarmer) {
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
            mysql.query(sql, idFarmer, (err, rows) => {
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

    static async verifyStakedFarmer(address) {
        logger.debug(`verifyStakedFarmer start`);
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
                    bud.type = 6 
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
                    logger.debug(`verifyStakedFarmer end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async checkByFieldTool(idField, hoeIdTool) {
        logger.debug(`checkByFieldTool start`)
        return new Promise((resolve, reject) => {
            /* let sql = `
                SELECT
                    idFieldTool 
                FROM
                    field_tool 
                WHERE
                    idField = ? 
                    AND idTool = ?
                ` */
            let sql = `
                SELECT
                    idFieldTool 
                FROM
                    field_tool_requirements 
                WHERE
                    idField = ? 
                    AND idTool = ?
                `
            mysql.query(sql, [idField, hoeIdTool], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkByFieldTool end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkUsingOfBuildingAndHoe(idFarmer, hoeIdInstance) {
        logger.debug(`checkUsingOfBuildingAndHoe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idFarming 
                FROM
                    farming 
                WHERE
                    status = 1 
                    AND 
                    (
                        idFarmer = ? 
                        OR idToolInstance = ?
                    )
                    AND farmingEndingTime >= current_timestamp 
                `
            mysql.query(sql, [idFarmer, hoeIdInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkUsingOfBuildingAndHoe end`)
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
    static async getRarityGivenIdField(idField) {
        logger.debug(`getRarityGivenIdField start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rarityRequired 
                FROM
                    field 
                WHERE
                    idField = ?
                `;
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getRarityGivenIdField end`);
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
    static async getFarmChance(idField) {
        logger.debug(`getFarmChance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    chanceItem, chanceRecipe 
                FROM
                    field 
                WHERE
                    idField = ?
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFarmChance end`)
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
    static async farmItems(idField) {
        logger.debug(`farmItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_i.itemProbability, TRUE, FALSE) AS farmed,
                    i.name, i.image, i.rarity 
                FROM
                    field_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idField = ?
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async farmableItems(idField) {
        logger.debug(`farmItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop, s_i.itemProbability,
                    i.name, i.image, i.rarity 
                FROM
                    field_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idField = ?
                ORDER BY 
                    s_i.itemProbability ASC
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async farmRecipes(idField) {
        logger.debug(`farmRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_r.recipeProbability, TRUE, FALSE) AS farmd,
                    rec.name, rec.image,
                    t.rarity 
                FROM
                    field_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                    JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                WHERE
                    s_r.idField = ?
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idField}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async farmableRecipes(idField) {
        logger.debug(`farmRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop, s_r.recipeProbability,
                    rec.name, rec.image, rec.rarity
                FROM
                    field_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                WHERE
                    s_r.idField = ?
                ORDER BY 
                    s_r.recipeProbability ASC
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idField}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async farmExp(idField) {
        logger.debug(`farmExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    IF ( RAND(CURRENT_TIME) < probability, TRUE, FALSE) AS farmed,
                    experience 
                FROM
                    field_farm 
                WHERE
                    idField = ?
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmExp end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async farmableFarms(idField) {
        logger.debug(`farmExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idFieldFarm, name, image, rarity,
                    probability,
                    experience 
                FROM
                    field_farm 
                WHERE
                    idField = ?
                ORDER BY 
                    probability ASC
                `
            mysql.query(sql, idField, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`farmExp end`)
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
    static async updateExpByAddress(address, farmedExp) {
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
            mysql.query(sql, [farmedExp, farmedExp, address], (err, rows) => {
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

    static async createExpByAddress(address, farmedExp) {
        logger.debug(`createExpByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO leaderboard 
                    (address, experience, experienceFisherman)
                VALUES
                    (?, ?, ?)
                `;

            mysql.query(sql, [address, farmedExp, farmedExp], (err, rows) => {
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

    static async updateExpFarmerByAddress(address, farmedExp) {
        logger.debug(`updateExpFarmerByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    leaderboard 
                SET
                    experienceFarmer = IF(experienceFarmer IS NULL, 0, experienceFarmer) + ? 
                WHERE
                    address = ?
                `
            mysql.query(sql, [farmedExp, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateExpFarmerByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getIdPassiveFarming() {
        logger.debug(`getIdPassiveFarming start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT IF(MAX(idPassiveFarming) IS NULL, 0, MAX(idPassiveFarming)) + 1 AS newIdPassiveFarming FROM farming`
            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getIdPassiveFarming end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].newIdPassiveFarming)
                }
            })
        })
    }
    static async createPassiveFarming(type, address, idField, id, quantity, idFarmer, idToolLevel, idToolInstance, idPassiveFarming, actionNumber, qtyBefore, qtyAfter, coolDown, idFarm, quantityFarm) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString().slice(0, -1)
        let endingTime = (new Date(nowTime + (serverConfig.cooldownSec.farmer * 1000) * (coolDown ? 1 : 0) )).toISOString().slice(0, -1)

        // let endingTime = (new Date(nowTime + (actionNumber * coolDown * 60 * 1000))).toISOString()
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    farming (idField, idItem, quantityItem, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming, quantityBefore, quantityAfter, idFarm, quantityFarm) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming, qtyBefore, qtyAfter, idFarm, quantityFarm]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    farming (idField, idRecipe, quantityRecipe, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming, quantityBefore, quantityAfter, idFarm, quantityFarm) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming, qtyBefore, qtyAfter, idFarm, quantityFarm]
        } else if (type == 4) { // farm
            sql = `
                INSERT INTO
                    farming (idField, idFarm, quantityFarm, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ? 
                    )
            `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             farming (idField, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ? 
        //             )
        //     `
        //     params = [idField, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, idPassiveFarming]
        // }
        logger.debug(`createPassiveFarming start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createPassiveFarming end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createFarming(type, address, idField, id, quantity, idFarmer, idToolLevel, idToolInstance, firstIdConsumable, secondIdConsumable, thirdIdConsumable, reduceCoolDown, noCoolDown, qtyBefore, qtyAfter, idFarm, quantityFarm) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString().slice(0, -1)
        let endingTime = (new Date(nowTime + ((reduceCoolDown ? serverConfig.cooldownSec.farmer * 0.8 : serverConfig.cooldownSec.farmer) * (noCoolDown ? 0 : 1) * 1000))).toISOString().slice(0, -1)
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    farming (idField, idItem, quantityItem, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable, quantityBefore, quantityAfter, idFarm, quantityFarm) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable, qtyBefore, qtyAfter, idFarm, quantityFarm]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    farming (idField, idRecipe, quantityRecipe, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable, quantityBefore, quantityAfter, idFarm, quantityFarm) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable, qtyBefore, qtyAfter, idFarm, quantityFarm]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             farming (idField, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ?, ?
        //             )
        //     `
        //     params = [idField, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable]
        // } 
        else if (type == 4) { // farm
            sql = `
                INSERT INTO
                    farming (idField, idFarm, quantityFarm, farmingStartingTime, farmingEndingTime, status, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idField, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFarmer, firstIdConsumable, secondIdConsumable, thirdIdConsumable]
        }
        logger.debug(`createFarming start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createFarming end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getFarmingEndingTime(address, idField, idFarmer, hoeIdInstance) {
        logger.debug(`getFarmingEndingTime start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    MAX(farmingEndingTime) AS time 
                FROM
                    farming 
                WHERE
                    address = ? 
                    AND status = 1 
                    AND idFarmer = ? 
                    AND idToolInstance = ? 
                    AND idField = ?
                `
            mysql.query(sql, [address, idFarmer, hoeIdInstance, idField], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFarmingEndingTime end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getFarmingGivenIdBuilding(idBuilding) {
        logger.debug(`getFarmingGivenFarmerId [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM farming WHERE status = 1 AND idFarmer = ? AND farmingEndingTime >= current_timestamp";
            mysql.query(sql, idBuilding, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getFarmingGivenFarmerId [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getFarmingHoeGivenidHoe(idHoe) {
        logger.debug(`getFarmingHoeGivenidHoe start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM farming WHERE (idToolInstance = ? ) AND status = 1 AND farmingEndingTime >= current_timestamp`
            mysql.query(sql, idHoe, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFarmingHoeGivenidHoe end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async UpdateFarmingStatus() {
        logger.debug(`UpdateFarmingStatus [START]`);
        return new Promise((resolve, reject) => {
            let sql = `
                update
                    farming
                set
                    status = 2,
                    farmingCompleteTime = farmingEndingTime
                where
                    status = 1
                    and farmingEndingTime < current_timestamp
                `;

            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`UpdateFarmingStatus [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    // static async UpdateFarmingStatus(idHoe){
    //     logger.debug(`getFarmingHoeGivenidHoe [START]`);
    //     return new Promise((resolve, reject) => {
    //         let sql = `UPDATE farming SET farmingCompleteTime = CASE WHEN (farmingEndingTime <= current_timestamp) THEN farmingEndingTime ELSE farmingCompleteTime WHERE idToolInstance = ? , 
    //         SET status = CASE WHEN (farmingCompleteTime != NULL ) THEN 2 ELSE status WHERE idToolInstance = ? `
    //         mysql.query(sql, [idHoe, idHoe], (err, rows) => {
    //             if(err) return reject(err);
    //             if(rows == undefined){
    //                 logger.error(`null error`);
    //                 return reject({
    //                     message: "undefined"
    //                 });
    //             }else{
    //                 logger.debug(`getFarmingHoeGivenidHoe [END]`);
    //                 return resolve(JSON.parse(JSON.stringify(rows)));
    //             }
    //         })
    //     });
    // }

    static async verifyOwnConsumablesFarmer(address, consumable) {
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
                    logger.debug(`createFarming end`)
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

module.exports = { FarmerQueries };