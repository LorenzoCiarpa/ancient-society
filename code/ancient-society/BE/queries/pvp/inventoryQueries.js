const { mysql } = require('../../config/databaseConfig');
const { mysqlPvp } = require('../../config/databaseConfig');
const { add } = require('../../logging/logger');
const logger = require('../../logging/logger');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig')
const { selectFromDB } = require('../../utils/selectFromDB')


//All the queries that have 2 in the name take from the alpha db

class InventoryQueries {
    static async getGearQuantity(address, idGearLevel) {
        logger.info(`getGearQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idGearInstance
                FROM 
                    gear_instance
                WHERE
                    address = ?
                AND
                    idGearLevel = ?
            `;

            mysqlPvp.query(sql, [address, idGearLevel], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getGearQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getLegendaryOwnership(address, idCardInstance) {
        logger.info(`getLegendaryOwnership start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM 
                    card_instance
                LEFT JOIN card c ON c.idCard=card_instance.idCard
                WHERE
                    address = ?
                AND
                    idCardInstance = ?
                AND
                    c.rarity = "LEGENDARY"
            `;

            mysqlPvp.query(sql, [address, idCardInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getLegendaryOwnership end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getItemQuantity(address, idItem) {
        logger.info(`getItemQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idItemInstance,
                quantity
            FROM 
                item_instance
            WHERE
                address = ?
            AND
                idItem = ?
            `;

            mysqlPvp.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getRecipeQuantity(address, idRecipe) {
        logger.info(`getRecipeQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idRecipeInstance,
                quantity
            FROM 
                recipe_instance
            WHERE
                address = ?
            AND
                idRecipe = ?
            `;

            mysqlPvp.query(sql, [address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getRecipeRequirements(address, idRecipeInstance) {
        logger.info(`InventoryQueries.getRecipeRequirements START`)
        let sql, params
        sql = `
        SELECT
        rec_ins.quantity AS recipeCount,
        rec.chanceCraft, rec.idCard, rec.idGear, rec.idItem, rec.itemQuantity,
        c_req.idPointRequirement,
        c_req.idItemRequirement,
        c_req.idGearRequirement,
        c_req.idRecipeRequirement,
        c_req.idCardRequirement, 
        p_req.quantity AS requiredPoints,
        i_req.idItem AS requiredIdItem,
        i_req.quantityItem AS requiredItemQuantity,
        i_req.burn AS requiredItemBurn,
        t_req.idGearLevel AS requiredIdGearLevel,
        t_req.burn AS requiredToolBurn,
        rec_req.idRecipe AS requiredIdRecipe,
        rec_req.quantity AS requiredRecipeQuantity,
        rec_req.burn AS requiredRecipeBurn,
        cr.idCard AS requiredCard,
        cr.idCardLevel AS requiredIdCardLevel,
        cr.burn AS requiredCardBurn
    FROM recipe_instance AS rec_ins
        JOIN recipe AS rec
            ON rec.idRecipe = rec_ins.idRecipe
        LEFT JOIN craft_requirements AS c_req
            ON c_req.idRecipe = rec.idRecipe
        LEFT JOIN point_requirements AS p_req
            ON p_req.idPointRequirement = c_req.idPointRequirement
        LEFT JOIN card_requirements cr
            ON cr.idCardRequirement = c_req.idCardRequirement
        LEFT JOIN item_requirements AS i_req
            ON i_req.idItemRequirement = c_req.idItemRequirement
        LEFT JOIN gear_requirements AS t_req
            ON t_req.idGearRequirement = c_req.idGearRequirement
        LEFT JOIN recipe_requirements AS rec_req
            ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
    WHERE
        rec_ins.idRecipeInstance = ?
        AND rec_ins.address = ?
        `;
        params = [idRecipeInstance, address];
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getRecipeRequirements2(address, idRecipeInstance) {
        logger.info(`InventoryQueries.getRecipeRequirements START`)
        let sql, params
        sql = `
            SELECT
                rec_ins.quantity AS recipeCount,
                rec.chanceCraft, rec.idTool, rec.idItem, rec.itemQuantity,
                c_req.idResourceRequirement,
                c_req.idItemRequirement,
                c_req.idToolRequirement,
                c_req.idRecipeRequirement,
                res_req.ancien AS requiredAncien,
                res_req.wood AS requiredWood,
                res_req.stone AS requiredStone,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                t_req.idToolLevel AS requiredIdToolLevel,
                t_req.burn AS requiredToolBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe_instance AS rec_ins
                JOIN recipe AS rec
                    ON rec.idRecipe = rec_ins.idRecipe
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN resource_requirements AS res_req
                    ON res_req.idResourceRequirement = c_req.idResourceRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN tool_requirements AS t_req
                    ON t_req.idToolRequirement = c_req.idToolRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec_ins.idRecipeInstance = ?
                AND rec_ins.address = ?
        `;
        params = [idRecipeInstance, address];
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getRecipeRequirementsByIdRecipe(idRecipe) {
        logger.info(`InventoryQueries.getRecipeRequirementsByIdRecipe START`)
        let sql, params
        sql = `
            SELECT
                rec.chanceCraft, rec.idGear, rec.idItem, rec.itemQuantity,
                c_req.idPointRequirement,
                c_req.idItemRequirement,
                c_req.idGearRequirement,
                c_req.idRecipeRequirement,
                p_req.quantity AS requiredPoints,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                g_req.idGearLevel AS requiredIdGearLevel,
                g_req.burn AS requiredGearBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe AS rec
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN point_requirements AS p_req
                    ON p_req.idPointRequirement = c_req.idPointRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN gear_requirements AS g_req
                    ON g_req.idGearRequirement = c_req.idGearRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getRecipeRequirementsByIdRecipe END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getNPCRecipeRequirements(idRecipe) {
        logger.info(`InventoryQueries.getNPCRecipeRequirements START`)
        let sql, params
        sql = `
        SELECT
        rec.chanceCraft, rec.idCard,rec.idGear, rec.idItem, rec.itemQuantity,
        c_req.idPointRequirement,
        c_req.idItemRequirement,
        c_req.idGearRequirement,
        c_req.idCardRequirement,
        c_req.idRecipeRequirement,
        p_req.quantity AS requiredPoints,
        i_req.idItem AS requiredIdItem,
    i_req.quantityItem AS requiredItemQuantity,
    i_req.burn AS requiredItemBurn,
    t_req.idGearLevel AS requiredIdGearLevel,
    t_req.burn AS requiredToolBurn,
    rec_req.idRecipe AS requiredIdRecipe,
    rec_req.quantity AS requiredRecipeQuantity,
    rec_req.burn AS requiredRecipeBurn,
    cr.idCard AS requiredCard,
    cr.idCardLevel AS requiredIdCardLevel,
    cr.burn AS requiredCardBurn       
    FROM recipe AS rec
    LEFT JOIN craft_requirements AS c_req
        ON c_req.idRecipe = rec.idRecipe
    LEFT JOIN point_requirements AS p_req
        ON p_req.idPointRequirement = c_req.idPointRequirement
    LEFT JOIN card_requirements cr
        ON cr.idCardRequirement = c_req.idCardRequirement
    LEFT JOIN item_requirements AS i_req
        ON i_req.idItemRequirement = c_req.idItemRequirement
    LEFT JOIN gear_requirements AS t_req
        ON t_req.idGearRequirement = c_req.idGearRequirement
    LEFT JOIN recipe_requirements AS rec_req
        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
    WHERE
        rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNPCRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getGemRecipeRequirements(idRecipe) {
        logger.info(`InventoryQueries.getGemRecipeRequirements START`)
        let sql, params
        sql = `
        SELECT
        rec.chanceCraft, rec.idCard,rec.idGear, rec.idItem, rec.itemQuantity,
        c_req.idPointRequirement,
        c_req.idItemRequirement,
        c_req.idGearRequirement,
        c_req.idCardRequirement,
        c_req.idRecipeRequirement,
        p_req.quantity AS requiredPoints,
        i_req.idItem AS requiredIdItem,
    i_req.quantityItem AS requiredItemQuantity,
    i_req.burn AS requiredItemBurn,
    t_req.idGearLevel AS requiredIdGearLevel,
    t_req.burn AS requiredToolBurn,
    rec_req.idRecipe AS requiredIdRecipe,
    rec_req.quantity AS requiredRecipeQuantity,
    rec_req.burn AS requiredRecipeBurn,
    cr.idCard AS requiredCard,
    cr.idCardLevel AS requiredIdCardLevel,
    cr.burn AS requiredCardBurn       
    FROM recipe AS rec
    LEFT JOIN craft_requirements AS c_req
        ON c_req.idRecipe = rec.idRecipe
    LEFT JOIN point_requirements AS p_req
        ON p_req.idPointRequirement = c_req.idPointRequirement
    LEFT JOIN card_requirements cr
        ON cr.idCardRequirement = c_req.idCardRequirement
    LEFT JOIN item_requirements AS i_req
        ON i_req.idItemRequirement = c_req.idItemRequirement
    LEFT JOIN gear_requirements AS t_req
        ON t_req.idGearRequirement = c_req.idGearRequirement
    LEFT JOIN recipe_requirements AS rec_req
        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
    WHERE
        rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getGemRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSingleInventoryData(address, idInventory, inventoryType) {
        logger.info(`InventoryQueries.getSingleInventoryData START`)
        let sql, params
        if (inventoryType == 'item') {
            sql = `
                SELECT
                    0 as level, i.rarity,
                    i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
                    'item' AS type,
                    i_ins.quantity,
                    i.name, i.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                    LEFT JOIN
                        chest AS c 
	                    ON c.idItem = i.idItem 
                    JOIN
                        menu AS m 
                        ON m.idMenu = i.idMenu 
                WHERE
                    i_ins.address = ?
                    AND
                    i_ins.quantity > 0
                    AND
                    i_ins.idItem = ?
                `
            params = [address, idInventory]
        } else if (inventoryType == 'recipe') {
            sql = `
                SELECT
                    0 as level, rec.rarity,
                    rec_ins.idRecipeInstance AS id, FALSE AS isChest,
                    'recipe' AS type,
                    rec_ins.quantity,
                    rec.name, rec.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    recipe_instance AS rec_ins 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = rec_ins.idRecipe 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                WHERE
                    rec_ins.address = ?
                    AND
                    rec_ins.quantity > 0
                    AND
                    rec_ins.idRecipe = ?
                `
            params = [address, idInventory]
        } else if (inventoryType == 'card') {
            sql = `
                SELECT
                    cl.level as level, ca.rarity,
                    car_ins.idCardInstance AS id, FALSE AS isChest,
                    'card' AS type,
                    1 as quantity,
                    ca.name, ca.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    card_instance AS car_ins
                    JOIN
                        card_level AS cl 
                        ON cl.idCardLevel = car_ins.idCardLevel  
                    JOIN
                        card AS ca 
                        ON ca.idCard = car_ins.idCard 
                    JOIN
                        menu AS m 
                        ON m.idMenu = ca.idMenu 
                WHERE
                    car_ins.address = ?
                    AND
                    car_ins.idCard = ? 
                `
            params = [address, idInventory]
        } else if (inventoryType == 'gear') {
            sql = `
                SELECT
                    gl.level as level, g.rarity,
                    g_ins.idGearInstance AS id, FALSE AS isChest,
                    'gear' AS type,
                    1 as quantity,
                    g.name, g.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    gear_instance AS g_ins
                    JOIN
                        gear_level AS gl 
                        ON gl.idGearLevel = g_ins.idGearLevel  
                    JOIN
                        gear AS g 
                        ON g.idGear = g_ins.idGear 
                    JOIN
                        menu AS m 
                        ON m.idMenu = g.idMenu 
                WHERE
                    g_ins.address = ?
                    AND
                    g_ins.idGear = ? 
                `
            params = [address, idInventory]
        }
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSingleInventoryData END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getInventoryListFromAddress(address) {
        logger.info(`InventoryQueries.getInventoryListFromAddress START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    0 as level, 0 as idGearLevel, i.rarity,
                    i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
                    'item' AS type,
                    i_ins.quantity,
                    i.name, i.image, '' as category,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                    LEFT JOIN
                        chest AS c 
	                    ON c.idItem = i.idItem 
                    JOIN
                        menu AS m 
                        ON m.idMenu = i.idMenu 
                WHERE
                    i_ins.address = ?
                    AND
                    i_ins.quantity > 0
                UNION
                SELECT
                    g_lev.level, g_lev.idGearLevel, g.rarity,
                    g_ins.idGearInstance AS id, FALSE AS isChest,
                    'gear' AS type,
                    1 AS quantity,
                    g.name, g.image, '' as category,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    gear_instance AS g_ins 
                    JOIN
                        gear_level AS g_lev 
			            ON g_lev.idGearLevel = g_ins.idGearLevel 
                    JOIN
                        gear AS g 
                        ON g.idGear = g_ins.idGear
                    JOIN
                        menu AS m 
                        ON m.idMenu = g.idMenu 
                WHERE
                    g_ins.address = ? 
                UNION
                SELECT
                    0 as level, 0 as idGearLevel, rec.rarity,
                    rec_ins.idRecipeInstance AS id, FALSE AS isChest,
                    'recipe' AS type,
                    rec_ins.quantity,
                    rec.name, rec.image, rec.category,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    recipe_instance AS rec_ins 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = rec_ins.idRecipe 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                WHERE
                    rec_ins.address = ?
                    AND
                    rec_ins.quantity > 0
                `
            mysqlPvp.query(sql, [address, address, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getInventoryListFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getCardListFromAddress(address) {
        logger.info(`InventoryQueries.getCardListFromAddress START`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                    cl.level as level, cl.idCardLevel, c.rarity,c.category,
                    cl.attack, cl.speed, cl.range, cl.hp, cl.buffPercentage, cl.buffAttribute, cl.buffCategory,
                    c_ins.weaponSlot, c_ins.shieldSlot, c_ins.talismanSlot,
                    c_ins.idCardInstance AS id,
                    c_ins.idCard AS card_id,
                    c.name, c.image,c.description,
                    m.craft, m.view, m.send, m.sell
                FROM
                    card_instance AS c_ins 
                    JOIN
                        card AS c 
                        ON c.idCard = c_ins.idCard 
                    JOIN user u
                    ON u.address = c_ins.address
                    LEFT JOIN
                        card_level AS cl
                        ON cl.idCardLevel = c_ins.idCardLevel 
                    LEFT JOIN
                upgrade_card_requirements AS up_req
                ON up_req.idCardLevel = (SELECT idCardLevel as newIdLevel
                    FROM card_level as cl
                    WHERE cl.idCard = c_ins.idCard
                    AND level = (SELECT level FROM card_level as cl2 WHERE cl2.idCardLevel = c_ins.idCardLevel) + 1)
            LEFT JOIN
                point_requirements AS p_req
                ON p_req.idPointRequirement = up_req.idPointRequirement
            LEFT JOIN
                item_requirements AS i_req
                ON i_req.idItemRequirement = up_req.idItemRequirement
            LEFT JOIN
                card_requirements AS c_req
                ON c_req.idCardRequirement = up_req.idCardRequirement
            LEFT JOIN card_instance ci2
                ON c_req.idCard = ci2.idCard
                AND ci2.address = c_ins.address    
            LEFT JOIN item_instance ii
                ON ii.idItem = i_req.idItem 
                AND ii.address = c_ins.address
                    JOIN
                        menu AS m 
                        ON m.idMenu = c.idMenu 
                WHERE
                    c_ins.address = ?
            `;

            mysqlPvp.query(sql, [address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getInventoryListFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async createCardInstanceGivenAddressIdcardAndIdcardlevel(address, idCard, idCardLevel) {
        let sql = `
            INSERT INTO
                card_instance (address, idCard, idCardLevel) 
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                `;
        return await selectFromDB(sql, [address, idCard, idCardLevel], 'InventoryQueries.createCardInstanceGivenAddressAndIdcard');
    }

    static async getCardInstanceDataFromAddressAndIdCardInstance(address, idCardInstance) {
        let sql = `
                SELECT 
                    c.category,ci.idCard , ci.idCardLevel, ci.weaponSlot, ci.shieldSlot, ci.talismanSlot, ci.isBattling, m.send AS 'isSendable' 
                FROM 
                    card_instance ci
                LEFT JOIN
                    card c 
                ON
                    c.idCard = ci.idCard
                LEFT JOIN
                    menu m 
                ON 
                    c.idMenu = m.idMenu 
                WHERE 
                    ci.address = ?
                AND 
                    ci.IdCardInstance = ?
            `;

        return await selectFromDB(sql, [address, idCardInstance], 'InventoryQueries.getCardInstanceDataFromAddressAndIdCardInstance');
    }

    static async getCardInstanceFromAddress(address, idCardInstance) {
        let sql = `
                SELECT 
                    c.idCard, c.name, c.description, c.image, c.rarity, c.category, cl.level, cl.isUpgradable, cl.idCardLevel,
                    cl.attack, cl.hp, cl.speed, cl.range, cl.chanceUpgrade, cl.buffPercentage, cl.buffAttribute, cl.buffCategory, u.pvpPoints, pr.quantity AS 'upgradePointsRequired', ci.weaponSlot, ci.shieldSlot, ci.talismanSlot, ci.idCardInstance
                FROM 
                    card c 
                LEFT JOIN 
                    card_instance ci 
                ON 
                    c.idCard = ci.idCard
                LEFT JOIN 
                    card_level cl 
                ON 
                    ci.idCardLevel = cl.idCardLevel 
                LEFT JOIN 
                    point_requirements pr 
                ON 
                    pr.idPointRequirement = c.idCard 
                LEFT JOIN 
                    user u 
                ON 
                    u.address = ci.address
                WHERE ci.address = ?
                AND ci.idCardInstance = ?
            `;

        return await selectFromDB(sql, [address, idCardInstance], 'InventoryQueries.getCardInstanceFromAddress')
    }

    static async getCardInstanceFromIdCardInstance(idCardInstance, address) {
        logger.info(`InventoryQueries.getCardInstanceFromIdCardInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    *, c.rarity
                FROM 
                    card_instance ci 
                LEFT JOIN
                    card c
                ON 
                    ci.idCard = c.idCard
                WHERE 
                    ci.IdCardInstance = ?
                AND ci.address = ?
            `;

            mysqlPvp.query(sql, [idCardInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getCardInstanceFromIdCardInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            });
        });
    }

    static async getItemRequirementsFromAddressAndIdCardLevel(address, idCardLevel) {
        let sql = `
        SELECT 
        ir.idItem, ii.quantity, ir.quantityItem AS "upgradeItemQuantity", i.name, i.image
        FROM 
            upgrade_card_requirements cu
        LEFT JOIN 
            item_requirements ir ON cu.idItemRequirement=ir.idItemRequirement
        LEFT JOIN
            item i  ON  i.idItem = ir.idItem
        LEFT JOIN
            item_instance ii
            ON ir.idItem=ii.idItem AND ii.address = ?
        WHERE 
        cu.idCardLevel=?
            `;

        return await selectFromDB(sql, [address, idCardLevel], 'InventoryQueries.getItemRequirementsFromAddressAndIdCardLevel')
    }

    static async getCardStatsGivenIdCardAndLevel(idCard, level) {
        let sql = `
                SELECT 
                    cl.level , cl.hp , cl.attack , cl.speed , cl.range , cl.buffPercentage , cl.buffAttribute , cl.buffCategory
                FROM 
                    card_level cl 
                INNER JOIN 
                    card c 
                    ON c.idCard = cl.idCard 
                WHERE 
                    c.idCard = ?
                AND 
                    cl.level = ?
                `;

        return await selectFromDB(sql, [idCard, level], 'InventoryQueries.getCardStatsGivenIdAndLevel')
    }


    static async updateSlotInCardInstanceGivenSlotAndIdcardinstance(slotToChange, idGearInstance, idCardInstance) {
        let sql =
            `UPDATE 
                    card_instance
                SET
                    ${slotToChange} = ?
                WHERE 
                    IdCardInstance = ?
            `;

        return await selectFromDB(sql, [idGearInstance, idCardInstance], 'InventoryQueries.updateSlotInCardInstanceGivenSlotAndIdcardinstance')
    }

    static async unequipGearSlotFromIdcardinstanceGivenSlotAndIdcardinstance(slotToUnequip, idCardInstance) {
        let sql = `
                UPDATE 
                    card_instance
                SET
                    ${slotToUnequip} = NULL 
                WHERE 
                    IdCardInstance = ?
            `;

        return await selectFromDB(sql, [idCardInstance], 'InventoryQueries.unequipGearSlotFromIdcardinstanceGivenSlotAndIdcardinstance');
    }

    static async createGearInstanceGivenAddressIdGearAndIdgearlevel(address, idGear, idGearLevel) {
        let sql = `
                INSERT INTO 
                gear_instance (address, idGear, idGearLevel, equipped)
                VALUES
                    (
                        ?,
                        ?,
                        ?,
                        0
                    )
            `;

        return await selectFromDB(sql, [address, idGear, idGearLevel], 'InventoryQueries.createGearInstanceGivenAddressIdGearAndIdgearlevel');
    }

    static async getGearInstanceDataFromIdgearinstanceAndAddress(idGearInstance, address) {
        let sql = `
                SELECT 
                    gi.idGearInstance, gi.idGear, gi.idGearLevel, gi.equipped, gi.pkCard, g.type, g.onCard, g.onCategory, m.send AS 'isSendable'
                FROM 
                    gear_instance gi 
                INNER JOIN
                    gear g 
                ON 	
                    g.idGear = gi.idGear
                INNER JOIN 
                    menu m 
                ON 
                    m.idMenu = g.idMenu 
                WHERE 
                    gi.idGearInstance = ?
                AND 
                    gi.address = ?
            `;

        return await selectFromDB(sql, [idGearInstance, address], 'InventoryQueries.getGearInstanceDataFromAdressAndIdgearinstance')
    }

    static async equipGearFromIdGearInstance(idCardInstance, idGearInstance) {
        let sql =
            `UPDATE 
                    gear_instance 
                SET
                    equipped = 1, 
                    pkCard = ?
                WHERE 
                    idGearInstance = ?
        `;

        return await selectFromDB(sql, [idCardInstance, idGearInstance], 'InventoryQueries.equipGearFromIdGearInstance');
    }

    static async unequipGearFromIdGearInstance(idGearInstance) {
        let sql = `
            UPDATE 
                gear_instance 
            SET 
                equipped = 0,
                pkCard = NULL
            WHERE 
                idGearInstance = ?
            `;

        return await selectFromDB(sql, [idGearInstance], 'InventoryQueries.unequipGearFromIdGearInstance');
    }

    static async getGearImageFromIdgear(idGear) {
        let sql = `
                SELECT 
                    g.image 
                FROM 
                    gear_instance gi 
                LEFT JOIN
                    gear g 
                ON
                    gi.idGear = g.idGear 
                WHERE
                    gi.idGearInstance = ?
            `;

        return await selectFromDB(sql, [idGear], 'InventoryQueries.getGearImageFromIdgear');
    }

    static async getGearFromIdgear(idGear) {
        let sql = `
                SELECT 
                    g.*, gl.percentageBuff, gl.flatBuff, gl.buffAttribute
                FROM 
                    gear_instance gi 
                LEFT JOIN
                    gear g 
                ON
                    gi.idGear = g.idGear 
                LEFT JOIN
                    gear_level gl 
                ON
                    gi.idGearLevel = gl.idGearLevel 
                WHERE
                    gi.idGearInstance = ?
            `;

        return await selectFromDB(sql, [idGear], 'InventoryQueries.getGearFromIdgear');
    }

    static async getGearInfoFromAddressAndIdGear(address, idGear) {
        let sql = `
                SELECT 
                    gi.idGearInstance, g.name, g.description, g.image, g.rarity, gl.level, 
                    gl.percentageBuff, gl.flatBuff, gl.type, gl.isUpgradable, gl.buffAttribute, gl.buffAttribute, gi.equipped AS 'isEquipable'
                FROM 
                    gear_instance gi  
                LEFT JOIN
                    gear g 
                ON		
                    g.idGear = gi.idGear
                LEFT JOIN 
                    gear_level gl 
                ON 	
                    gl.idGearLevel = gi.idGearLevel
                WHERE gi.address = ?
                AND gi.idGearInstance = ?
        `;

        return await selectFromDB(sql, [address, idGear], 'InventoryQueries.getGearInfoFromAddressAndIdGear');
    }

    static async getAllGearAvailableFromAddress(address) {
        let sql = `
                SELECT 
                    gi.idGearInstance, g.name, g.description, g.image, g.rarity, g.onCard, g.onCategory , gl.level, 
                    gl.percentageBuff, gl.flatBuff, gl.type, gl.buffAttribute, gl.isUpgradable, gi.equipped AS 'isEquipable'
                FROM 
                    gear_instance gi  
                LEFT JOIN
                    gear g 
                ON		
                    g.idGear = gi.idGear
                LEFT JOIN 
                    gear_level gl 
                ON 	
                    gl.idGearLevel = gi.idGearLevel
                WHERE gi.address = ?
                ORDER BY g.type 
        `;

        return await selectFromDB(sql, [address], 'InventoryQueries.getAllGearAvailableFromAddress');
    }

    static async getLeagueFromIdLeague(idLeague) {
        let sql = `
                SELECT 
                    l.idLeague , l.name , l.image , l.minTrophies  
                FROM 
                    league l 
                WHERE 
                    idLeague = ?
        `;


        return await selectFromDB(sql, [idLeague], 'InventoryQueries.getLeagueFromIdLeague');
    }

    static async getPlayersRankedInLeague(idLeague) {
        let sql = `
                SELECT
                    u.address, u.name, u.image, u.warPoints, u.matchCount, u.matchWon 
                FROM 
                    user u 
                WHERE 
                    u.idLeague = ?
                ORDER BY u.warPoints  DESC
            `;

        return await selectFromDB(sql, [idLeague], 'InventoryQueries.getPlayersRankedInLeague');
    }

    static async getRewardsFromIdLeague(idLeague) {
        let sql = `
        SELECT
        r.quantity,
        i.idItem ,i.name as itemName,i.image as itemImage,i.description as itemDescription, 
        re.idRecipe,re.name as recipeName ,re.image as recipeImage,re.description as recipeDescription,
        gl.level as gearLevel,gl.*,g.name as gearName,g.image as gearImage,g.idGear, 
        cl.*,cl.level as cardLevel,c.name as cardName,c.image as cardImage,c.idCard 
        FROM 
            reward r
        LEFT JOIN
            item i ON r.idItem = i.idItem
        LEFT JOIN
            recipe re ON re.idRecipe=r.idRecipe
        LEFT JOIN
            gear_level gl ON gl.idGearLevel= r.idGearLevel
        LEFT JOIN
            gear g ON gl.idGear = g.idGear
        LEFT JOIN
            card_level cl ON r.idCardLevel=cl.idCardLevel
        LEFT JOIN 
            card c ON cl.idCard = c.idCard 
        WHERE 
            r.idLeague = ?
            `;

        return await selectFromDB(sql, [idLeague], 'InventoryQueries.getRewardsFromIdLeague');
    }

    static async getWarsFromAddress(address) {
        let sql = `
                SELECT 
                    w.idWar, w.address1, w.address2, w.winner,w.endingTime 
                FROM 
                    war w 
                WHERE 
                    (w.address1 = ? 
                    OR 
                    w.address2 = ?)
                AND
                    !ISNULL(w.winner)
                ORDER BY
                    endingTime desc
        `;
        return await selectFromDB(sql, [address, address], 'InventoryQueries.getWarsFromAddress');
    }

    static async getActiveWarsFromAddress(address) {
        let sql = `
                SELECT 
                    w.*, a.name, a.description, a.rangeNumber, a.numberColumns, a.image as arena_image
                FROM war w 
                LEFT JOIN arena a
                    on a.idArena = w.idArena
                WHERE 
                    w.winner IS NULL
                AND 
                    ( w.address1 = ? OR w.address2 = ? )
                ORDER BY
                    idWar DESC 
        `;

        return await selectFromDB(sql, [address, address], 'InventoryQueries.getActiveWarsFromAddress');
    }

    static async getAffixHistoryFromIdWar(idWar) {
        logger.info(`InventoryQueries.getAffixHistoryFromIdWar START`)
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT 
                        ah.turn1, ah.turn2, ah.turn3 
                    FROM 
                        affixHistory ah 
                    WHERE 
                        ah.idWar = ?
            `;

            mysqlPvp.query(sql, [idWar], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getAffixHistoryFromIdWar END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            });
        });
    }

    static async createBattle(idWar, turn, address, disposition, legendaryCard, affixIds, status = 'ready') {

        const { battleExpireTime } = serverConfig.cooldownSec

        let sql = `
                INSERT INTO 
                    battle(idWar, turn, address, disposition, status, legendary, affixIds, startingTime, expireTime) 
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP(),
                    DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL ${battleExpireTime} SECOND)
                )
            `;

        return await selectFromDB(sql, [idWar, turn, address, disposition, status, legendaryCard, affixIds], 'InventoryQueries.createBattle');
    }

    static async getArenaFromIdArena(idArena) {
        logger.info(`InventoryQueries.getArenaFromIdArena START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    * 
                FROM 
                    arena a 
                WHERE 
                    a.idArena = ?
            `;

            mysqlPvp.query(sql, [idArena], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getArenaFromIdArena END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            });
        });
    }

    static async getBattlesFromIdWar(idWar) {
        let sql = `
                SELECT 
                    b.address , SUM(b.win) AS 'points', u.name , u.image 
                FROM 
                    battle b 
                INNER JOIN
                    user u 
                ON 
                    u.address = b.address 
                WHERE 
                    b.idWar = ?
                GROUP BY 
                    b.address
            `;

        return await selectFromDB(sql, [idWar], 'InventoryQueries.getBattlesFromIdWar');
    }


    static async addChestLoots(address,) {

    }
    static async getChestLoots(idItemInstance) {
        logger.info(`InventoryQueries.getChestLoots START`)
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT
                    i.idItem as id, 'item' as type, i.name, i.description, i.image, i.rarity,
                    c_l_i.dropProbability, c_l_i.maxQuantity, c_l_i.alpha, c_l_i.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_item AS c_l_i 
                        ON c_l_i.idChest = c.idChest 
                    JOIN
                        item AS i 
                        ON i.idItem = c_l_i.idItem 
                WHERE
                    i_ins.idItemInstance = ?
                UNION
                SELECT
                    rec.idRecipe as id, 'recipe' as type, rec.name, rec.description, rec.image, rec.rarity,
                    c_l_r.dropProbability , c_l_r.maxQuantity, c_l_r.alpha, c_l_r.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_recipe AS c_l_r 
                        ON c_l_r.idChest = c.idChest 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = c_l_r.idRecipe 
                WHERE
                    i_ins.idItemInstance = ?
                UNION
                SELECT
                    ca.idCard as id, 'card' as type, ca.name, ca.description, ca.image, ca.rarity,
                    c_l_c.dropProbability, c_l_c.maxQuantity, c_l_c.alpha, c_l_c.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_card AS c_l_c 
                        ON c_l_c.idChest = c.idChest 
                    JOIN
                        card AS ca 
                        ON ca.idCard = c_l_c.idCard 
                WHERE
                    i_ins.idItemInstance = ?
                UNION
                SELECT
                    g.idGear as id, 'gear' as type, g.name, g.description, g.image, g.rarity, 
                    c_l_g.dropProbability, c_l_g.maxQuantity, c_l_g.alpha, c_l_g.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_gear AS c_l_g 
                        ON c_l_g.idChest = c.idChest 
                    JOIN
                        gear AS g 
                        ON g.idGear = c_l_g.idGear 
                WHERE
                    i_ins.idItemInstance = ?
                `
            mysqlPvp.query(sql, [idItemInstance, idItemInstance, idItemInstance, idItemInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getChestLoots END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRecipeNpcInstancePVP(idRecipe, address) {
        logger.info(`getRecipeNpcInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            rec.idRecipe AS id,
            'recipe' AS type,
            rec.idRecipe, rec.name, rec.image, rec.description, rec.chanceCraft,
            m.craft, m.view, m.send, m.sell,
            g.name AS productName, g.image AS productImage,
            r_i.name AS productName1, r_i.image AS productImage1,
            r_c.name AS productName2, r_c.image AS productImange2,
            rec.itemQuantity AS productQuantity,
            c_req.idPointRequirement, c_req.idItemRequirement, c_req.idGearRequirement, c_req.idRecipeRequirement, cr.idCardRequirement,
            IF(p_req.quantity IS NULL, 0, p_req.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            ci.IdCardInstance,
            IF(IF(p_req.quantity IS NULL, 0, p_req.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointsAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name AS requiredItemName, i.image AS requiredItemImage,
            c.name AS requiredCardName, c.image AS requiredCardImage,
            g_req.burn, g_ins.idGearInstance,
            g_lev.level AS requiredGearLevel,
            g_lev.idGearLevel AS requiredIdGearLevel,
            r_g.name AS requiredGearName, r_g.image AS requiredGearImage,
            IF(g_ins.idGearInstance IS NULL, FALSE, TRUE) AS isGearAllowed,
            r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
            IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
            IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
            r_rec_ins.idRecipeInstance 
        FROM
            recipe AS rec
            JOIN
                user AS u 
                ON u.address = ?
            JOIN
                menu AS m 
                ON m.idMenu = rec.idMenu 
            LEFT JOIN
                gear AS g 
                ON g.idGear = rec.idGear 
            LEFT JOIN
                item AS r_i 
                ON r_i.idItem = rec.idItem
            LEFT JOIN
            	card AS r_c
            	ON r_c.idCard = rec.idCard
            LEFT JOIN
                craft_requirements AS c_req 
                ON c_req.idRecipe = rec.idRecipe 
            LEFT JOIN
                point_requirements AS p_req 
                ON p_req.idPointRequirement = c_req.idPointRequirement 
            LEFT JOIN
            	card_requirements cr 
            	ON cr.idCardRequirement = c_req.idCardRequirement
            LEFT JOIN
            	card_instance ci
            	ON ci.address = ?
            	AND ci.idCardLevel = cr.idCardLevel
            LEFT JOIN
            	card c
            	ON ci.idCard=c.idCard
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = c_req.idItemRequirement 
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = ? 
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
            LEFT JOIN
                gear_requirements AS g_req 
                ON g_req.idGearRequirement = c_req.idGearRequirement 
            LEFT JOIN
                gear_level AS g_lev 
                ON g_lev.idGearLevel = g_req.idGearLevel 
            LEFT JOIN
                gear AS r_g 
                ON r_g.idGear = g_lev.idGear 
            LEFT JOIN
                gear_instance AS g_ins 
                ON g_ins.address = ?
                AND g_ins.idGearLevel  = g_req.idGearLevel 
            LEFT JOIN
                recipe_requirements AS rec_req 
                ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
            LEFT JOIN
                recipe AS r_rec 
                ON r_rec.idRecipe = rec_req.idRecipe 
            LEFT JOIN
                recipe_instance AS r_rec_ins 
                ON r_rec_ins.address = ?
                AND r_rec_ins.idRecipe = rec_req.idRecipe 
        WHERE
            rec.idRecipe = ? 
                `
            mysqlPvp.query(sql, [address, address, address, address, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getRecipeNpcInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType(address, idInventoryInstance, inventoryType) {
        logger.info(`InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType START`)
        let sql, params
        if (inventoryType == 'item') {
            sql = `
            SELECT
            i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
            'item' AS type,
            i_ins.quantity, i.name, i.description, i.image,
            m.craft, m.view, m.send, m.sell,
            c.minDrops, c.maxDrops,
            IF(p_req.quantity  IS NULL, 0, p_req.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_req.burn, i_inst.idItemInstance,
            IF(IF(p_req.quantity  IS NULL, 0, p_req.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_inst.quantity IS NULL, 0, i_inst.quantity), FALSE, TRUE) AS isItemAllowed,
            ins_i.name AS requiredItemName, ins_i.image AS requiredItemImage 
        FROM
            item_instance AS i_ins 
            JOIN
                item AS i 
                ON i.idItem = i_ins.idItem 
            LEFT JOIN
                chest AS c 
                ON c.idItem = i.idItem 
            LEFT JOIN
                chest_requirements AS c_req 
                ON c_req.idChest = c.idChest 
            LEFT JOIN
                point_requirements AS p_req 
                ON p_req.idPointRequirement = c_req.idPointRequirement 
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = c_req.idItemRequirement 
            LEFT JOIN
                item_instance AS i_inst 
                ON i_inst.idItem = i_req.idItem 
                AND i_inst.address = ? 
            LEFT JOIN
                item AS ins_i 
                ON ins_i.idItem = i_req.idItem 
            JOIN
                user AS u 
                ON u.address = ? 
            JOIN
                menu AS m 
                ON m.idMenu = i.idMenu 
        WHERE
            i_ins.idItemInstance = ? 
            AND i_ins.address = ?
                `
            params = [address, address, idInventoryInstance, address]
        } else if (inventoryType == 'recipe') {
            sql = `
            SELECT
            rec_ins.idRecipeInstance AS id,
            'recipe' AS type,
            rec_ins.quantity,
            rec.idRecipe, rec.name, rec.image, rec.description, rec.chanceCraft, rec.category,
            m.craft, m.view, m.send, m.sell,
            g.name AS productName, g.image AS productImage,
            r_i.name AS productName1, r_i.image AS productImage1,
            r_c.name AS productName2, r_c.image AS productImange2,
            rec.itemQuantity AS productQuantity,
            c_req.idPointRequirement, c_req.idItemRequirement, c_req.idGearRequirement, c_req.idRecipeRequirement, cr.idCardRequirement,
            IF(p_req.quantity IS NULL, 0, p_req.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            ci.IdCardInstance,
            IF(IF(p_req.quantity IS NULL, 0, p_req.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointsAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name AS requiredItemName, i.image AS requiredItemImage,
            g_req.burn, g_ins.idGearInstance,
            g_lev.level AS requiredGearLevel,
            g_lev.idGearLevel AS requiredIdGearLevel,
            r_g.name AS requiredGearName, r_g.image AS requiredGearImage,
            IF(g_ins.idGearInstance IS NULL, FALSE, TRUE) AS isGearAllowed,
            cr.burn, ci.IdCardInstance,
            cl.level AS requiredCardLevel,
            cl.idCardLevel AS requiredIdCardLevel,
            c.name AS requiredCardName, c.image AS requiredCardImage,
            IF(ci.IdCardInstance IS NULL, FALSE, TRUE) AS isCardAllowed,
            r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
            IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
            IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
            r_rec_ins.idRecipeInstance 
        FROM
            recipe_instance AS rec_ins 
            JOIN
                user AS u 
                ON u.address = rec_ins.address 
            JOIN
                recipe AS rec 
                ON rec.idRecipe = rec_ins.idRecipe 
            JOIN
                menu AS m 
                ON m.idMenu = rec.idMenu 
            LEFT JOIN
                gear AS g 
                ON g.idGear = rec.idGear 
            LEFT JOIN
                item AS r_i 
                ON r_i.idItem = rec.idItem
            LEFT JOIN
            	card AS r_c
            	ON r_c.idCard = rec.idCard
            LEFT JOIN
                craft_requirements AS c_req 
                ON c_req.idRecipe = rec_ins.idRecipe 
            LEFT JOIN
                point_requirements AS p_req 
                ON p_req.idPointRequirement = c_req.idPointRequirement 
            LEFT JOIN
            	card_requirements cr 
            	ON cr.idCardRequirement = c_req.idCardRequirement
            LEFT JOIN 
            	card_level cl 
            	ON cl.idCardLevel = cr.idCardLevel 
            LEFT JOIN
            	card c
            	ON c.idCard=cl.idCard
            LEFT JOIN
            	card_instance ci
            	ON ci.address = rec_ins.address
            	AND ci.idCardLevel = cr.idCardLevel
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = c_req.idItemRequirement 
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = rec_ins.address 
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
            LEFT JOIN
                gear_requirements AS g_req 
                ON g_req.idGearRequirement = c_req.idGearRequirement 
            LEFT JOIN
                gear_level AS g_lev 
                ON g_lev.idGearLevel = g_req.idGearLevel 
            LEFT JOIN
                gear AS r_g 
                ON r_g.idGear = g_lev.idGear 
            LEFT JOIN
                gear_instance AS g_ins 
                ON g_ins.address = rec_ins.address 
                AND g_ins.idGearLevel  = g_req.idGearLevel 
            LEFT JOIN
                recipe_requirements AS rec_req 
                ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
            LEFT JOIN
                recipe AS r_rec 
                ON r_rec.idRecipe = rec_req.idRecipe 
            LEFT JOIN
                recipe_instance AS r_rec_ins 
                ON r_rec_ins.address = rec_ins.address 
                AND r_rec_ins.idRecipe = rec_req.idRecipe 
        WHERE
            rec_ins.idRecipeInstance = ?
            AND rec_ins.address = ?
            `
            params = [idInventoryInstance, address]
        } else if (inventoryType == 'gear') {
            sql = `
            SELECT
            g_ins.idGearInstance AS id, 1 AS quantity,g_ins.idGearLevel,g_ins.idGear,
            'gear' AS type, 'upgrade' AS action,
            g_lev.chanceUpgrade, g_lev.level, g_lev.isUpgradable, g_lev.percentageBuff, g_lev.flatBuff, g_lev.buffAttribute, g_lev.type as gType,
            g.name, g.image, g.description,g.rarity,
            m.craft, m.view, m.send, m.sell,
            IF(p_req.quantity  IS NULL, 0, p_req.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            IF(IF(p_req.quantity  IS NULL, 0, p_req.quantity) > u.pvpPoints , FALSE, TRUE) AS isPointsAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name as requiredItemName, i.image as requiredItemImage, 
                c_req.burn, c_ins.IdCardInstance ,
                c_lev.level AS requiredCardLevel,
                c_lev.idCardLevel AS requiredIdCardLevel,
                c.name AS requiredCardName, c.image AS requiredCardImage,
                IF(c_ins.IdCardInstance  IS NULL, FALSE, TRUE) AS isCardAllowed
        FROM
            gear_instance AS g_ins 
            JOIN
                user AS u 
                ON u.address = g_ins.address 
            JOIN
                gear_level AS g_lev 
                ON g_lev.idGearLevel = g_ins.idGearLevel 
            JOIN
                gear AS g 
                ON g.idGear = g_ins.idGear 
            JOIN
                menu AS m 
                ON m.idMenu = g.idMenu 
            LEFT JOIN
                upgrade_requirements AS up_req 
                ON up_req.idGearLevel = (SELECT idGearLevel as newIdLevel
                    FROM gear_level as gl
                    WHERE gl.idGear = g_ins.idGear 
                    AND level = (SELECT level FROM gear_level as gl2 WHERE gl2.idGearLevel = g_ins.idGearLevel) + 1)  
            LEFT JOIN 
                card_requirements AS c_req
                ON c_req.idCardRequirement = up_req.idCardRequirement
            LEFT JOIN
                card_instance AS c_ins
                ON c_ins.address = g_ins.address
                AND c_ins.idCardLevel = c_req.idCardLevel
            LEFT JOIN
                card_level AS c_lev
                ON c_lev.idCardLevel = c_ins.idCardLevel 
            LEFT JOIN
                card as c on c.idCard = c_ins.IdCard
            LEFT JOIN
                point_requirements AS p_req 
                ON p_req.idPointRequirement = up_req.idPointRequirement 
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = up_req.idItemRequirement
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = g_ins.address 
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
        WHERE
            g_ins.idGearInstance = ?
            AND g_ins.address = ?
                `
            params = [idInventoryInstance, address]
        } else if (inventoryType == 'card') {
            sql = `
            SELECT
            c_ins.idCardInstance AS id, 1 AS quantity,
            'card' AS type, 'upgrade' AS action,
            c_lev.chanceUpgrade, c_lev.level, c_lev.isUpgradable,
            c.name, c.image, c.description,c.rarity,
            m.craft, m.view, m.send, m.sell,
            IF(p_req.quantity  IS NULL, 0, p_req.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,            
            i_ins.idItemInstance,
            IF(IF(p_req.quantity  IS NULL, 0, p_req.quantity) > u.pvpPoints , FALSE, TRUE) AS isPointsAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name as requiredItemName, i.image as requiredItemImage
            FROM
                card_instance AS c_ins 
            JOIN
                user AS u
                ON u.address = c_ins.address
            JOIN
                card_level AS c_lev 
                ON c_lev.idCardLevel = c_ins.idCardLevel 
            JOIN
                card AS c
                ON c.idCard = c_ins.idCard
            JOIN
                menu AS m
                ON m.idMenu = c.idMenu
            LEFT JOIN
                upgrade_card_requirements AS up_req
                ON up_req.idCardLevel = (SELECT idCardLevel as newIdLevel
                    FROM card_level as cl
                    WHERE cl.idCard = c_ins.idCard
                    AND level = (SELECT level FROM card_level as cl2 WHERE cl2.idCardLevel = c_ins.idCardLevel) + 1)
            LEFT JOIN
                point_requirements AS p_req
                ON p_req.idPointRequirement = up_req.idPointRequirement
            LEFT JOIN
                item_requirements AS i_req
                ON i_req.idItemRequirement = up_req.idItemRequirement
            LEFT JOIN
                card_requirements AS c_req
                ON c_req.idCardRequirement = up_req.idCardRequirement
            LEFT JOIN
                item_instance AS i_ins
                ON i_ins.address = c_ins.address
                AND i_ins.idItem = i_req.idItem
            LEFT JOIN
                item AS i
                ON i.idItem = i_req.idItem
        WHERE
            c_ins.idCardInstance = ?
            AND c_ins.address = ?
                `
            params = [idInventoryInstance, address]
        }

        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeGearInstance(idGearInstance) {
        logger.info(`InventoryQueries.removeGearInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE
                FROM
                    gear_instance 
                WHERE
                    idGearInstance = ?
                `
            mysqlPvp.query(sql, idGearInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.removeGearInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getNextLevelGearInfo(idGearLevel, idGear) {
        logger.info(`InventoryQueries.removeGearInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM gear_level as gl
            WHERE gl.idGear = ? 
            AND level = (SELECT level FROM gear_level as gl2 WHERE gl2.idGearLevel = ?) + 1
                `
            mysqlPvp.query(sql, [idGear, idGearLevel], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNextLevelInfo END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeCardInstance(idCardInstance) {
        logger.info(`InventoryQueries.removeCardInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE
                FROM
                    card_instance 
                WHERE
                    idCardInstance = ?
                `
            mysqlPvp.query(sql, idCardInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.removeCardInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSenderItemData(address, idItemInstance, quantity) {
        logger.info(`InventoryQueries.getSenderItemData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItem,
                    quantity - ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    item_instance 
                WHERE
                    idItemInstance = ? 
                    AND address = ?
                `
            mysqlPvp.query(sql, [quantity, idItemInstance, address, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSenderItemData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getReceiverItemData(address, idItem, quantity) {
        logger.info(`InventoryQueries.getReceiverItemData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity + ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `
            mysqlPvp.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getReceiverItemData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updatedItemInstanceByAddress(action, address, idItem, quantity) {
        logger.info(`InventoryQueries.updatedItemInstanceByAddress START`)
        let sql, params
        if (action == 'create') {
            sql = `
                INSERT IGNORE INTO
                    item_instance (address, idItem, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `
            params = [address, idItem, quantity]
        } else if (action == 'update') {
            sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = ? 
                WHERE
                    address = ? 
                    AND idItem = ?    
                `
            params = [quantity, address, idItem]
        } else if (action == 'remove') {
            sql = `
                DELETE
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `
            params = [address, idItem]
        }
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updatedItemInstanceByAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async changeToolOwner(idToolInstance, addressSender, addressReceiver) {
        logger.info(`InventoryQueries.changeToolOwner START`)
        let sql, params
        sql = `
            UPDATE
                tool_instance 
            SET 
                address = ?,
                equipped = 0,
                pkBuilding = null
            WHERE
                address = ? 
                AND idToolInstance = ?
            `
        params = [addressReceiver, addressSender, idToolInstance]
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.changeToolOwner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async changeGearOwner(idGearInstance, addressSender, addressReceiver) {
        logger.info(`InventoryQueries.changeGearOwner START`)
        let sql, params
        sql = `
            UPDATE
                gear_instance 
            SET 
                address = ?,
                equipped = 0,
                pkCard = null
            WHERE
                address = ? 
                AND idGearInstance = ?
            `
        params = [addressReceiver, addressSender, idGearInstance]
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.changeGearOwner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async changeGearOwner(idGearInstance, addressSender, addressReceiver) {
        logger.info(`InventoryQueries.changeGearOwner START`)
        let sql, params
        sql = `
            UPDATE
                gear_instance 
            SET 
                address = ?,
                equipped = 0,
                pkCard = null
            WHERE
                address = ? 
                AND idGearInstance = ?
            `
        params = [addressReceiver, addressSender, idGearInstance]
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.changeGearOwner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async changeCardOwner(idCardInstance, addressSender, addressReceiver) {
        logger.info(`InventoryQueries.changeCardOwner START`)
        let sql, params
        sql = `
            UPDATE
                card_instance 
            SET 
                address = ?,
                weaponSlot = null,
                shieldSlot = null,
                talismanSlot = null
            WHERE
                address = ? 
                AND idCardInstance = ?
            `
        params = [addressReceiver, addressSender, idCardInstance]
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.changeCardOwner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async updateBuildingEquipped(idToolInstance) {
        logger.info(`InventoryQueries.updateBuildingEquipped START`)
        let sql, params
        sql = `
            UPDATE
                buildings 
            SET 
                idToolInstance = null
            WHERE
                idToolInstance = ?
            `
        params = idToolInstance
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updateBuildingEquipped END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSenderRecipeData(address, idRecipeInstance, quantity) {
        logger.info(`InventoryQueries.getSenderRecipeData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe,
                    quantity - ? AS expectedQuantity,
                    quantity AS currentQuantity 
                FROM
                    recipe_instance 
                WHERE
                    idRecipeInstance = ? 
                    AND address = ?
                `
            mysqlPvp.query(sql, [quantity, idRecipeInstance, address, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSenderRecipeData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getReceiverRecipeData(address, idRecipe, quantity) {
        logger.info(`InventoryQueries.getReceiverRecipeData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity + ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    recipe_instance 
                WHERE
                    address = ? 
                    AND idRecipe = ?
                `
            mysqlPvp.query(sql, [quantity, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getReceiverRecipeData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updatedRecipeInstanceByAddress(action, address, idRecipe, quantity) {
        logger.info(`InventoryQueries.updatedRecipeInstanceByAddress START`)
        let sql, params
        if (action == 'create') {
            sql = `
                INSERT IGNORE INTO
                recipe_instance (address, idRecipe, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `
            params = [address, idRecipe, quantity]
        } else if (action == 'update') {
            sql = `
                UPDATE
                    recipe_instance 
                SET
                    quantity = ? 
                WHERE
                    address = ? 
                    AND idRecipe = ?    
                `
            params = [quantity, address, idRecipe]
        } else if (action == 'remove') {
            sql = `
                DELETE
                FROM
                    recipe_instance 
                WHERE
                    address = ? 
                    AND idRecipe = ?
                `
            params = [address, idRecipe]
        }
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updatedRecipeInstanceByAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfAddressExists(address) {
        logger.info(`InventoryQueries.checkIfAddressExists START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    address
                FROM
                    utente 
                WHERE
                    address = ?
                `
            mysqlPvp.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.checkIfAddressExists END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkIfUserHasIdItem(address, idItem, quantity) {
        logger.debug(`checkIfUserHasIdItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance,
                    quantity + ? AS expectedQuantity 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `

            mysqlPvp.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkIfUserHasIdItem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfUserHasChest(address, idItemInstance, openCount) {
        logger.debug(`checkIfUserHasChest start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c.idChest 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                WHERE
                    i_ins.idItemInstance = ? 
                    AND i_ins.address = ? 
                    AND quantity >= ?
                `

            mysqlPvp.query(sql, [idItemInstance, address, openCount], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkIfUserHasChest end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkRequirementsToOpenChest(address, idChest) {
        logger.debug(`checkRequirementsToOpenChest start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c.minDrops, c.maxDrops, c.alpha, c.beta,
                    IF(p_req.quantity IS NULL, 0, p_req.quantity) AS requiredPoints,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_req.burn, i_inst.idItemInstance,
                    IF(IF(p_req.quantity IS NULL, 0, p_req.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointsAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_inst.quantity IS NULL, 0, i_inst.quantity), FALSE, TRUE) AS isItemAllowed 
                FROM
                    chest AS c 
                    LEFT JOIN
                        chest_requirements AS c_req 
                        ON c_req.idChest = c.idChest 
                    LEFT JOIN
                        point_requirements AS p_req 
                        ON p_req.idPointRequirement = c_req.idPointRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_inst 
                        ON i_inst.idItem = i_req.idItem 
                        AND i_inst.address = ? 
                    JOIN
                        user AS u 
                        ON u.address = ? 
                WHERE
                    c.idChest = ?
            `

            mysqlPvp.query(sql, [address, address, idChest], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkRequirementsToOpenChest end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createItemInstance(address, idItem, quantity) {
        logger.debug(`createItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    item_instance (address, idItem, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `

            mysqlPvp.query(sql, [address, idItem, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`createItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateItemInstance(idItemInstance, quantity) {
        logger.debug(`updateItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = ? 
                WHERE
                    idItemInstance = ?
                `

            mysqlPvp.query(sql, [quantity, idItemInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getIdItemInstance(address, idItem) {
        logger.debug(`updateItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `

            mysqlPvp.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getItemInfoGivenIdItem(idItem) {
        logger.debug(`getItemInfoGivenIdItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    item
                WHERE 
                    idItem = ?
                `

            mysqlPvp.query(sql, [idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemInfoGivenIdItem end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getCardInfoGivenIdCard(idCard) {
        logger.debug(`getCardInfoGivenIdCard start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    card
                WHERE 
                    idCard = ?
                `

            mysqlPvp.query(sql, [idCard], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getCardInfoGivenIdCard end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getGearInfoGivenIdGear(idGear) {
        logger.debug(`getGearInfoGivenIdGear start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    gear
                WHERE 
                    idGear = ?
                `

            mysqlPvp.query(sql, [idGear], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getGearInfoGivenIdGear end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getMenuByIdGearInstance(idGearInstance) {
        logger.debug(`getMenuByIdGearInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                m.craft, m.view, m.send, m.sell
            FROM
                gear_instance AS g_ins
                JOIN
                    gear AS g
                    ON g.idGear = g_ins.idGear
                JOIN
                    menu AS m
                    ON m.idMenu = g.idMenu
            WHERE
                g_ins.idGearInstance = ?
                `

            mysqlPvp.query(sql, [idGearInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getMenuByIdGearInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getMenuByIdCardInstance(idCardInstance) {
        logger.debug(`getMenuByIdCardInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                m.craft, m.view, m.send, m.sell
            FROM
                card_instance AS c_ins
                JOIN
                    card AS c
                    ON c.idCard = c_ins.idCard
                JOIN
                    menu AS m
                    ON m.idMenu = c.idMenu
            WHERE
                c_ins.idCardInstance = ?
                `

            mysqlPvp.query(sql, [idCardInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getMenuByIdCardInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getMineConsumables(address) {
        logger.debug(`getMineConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                item_consumable_mining AS i_con_m 
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_m.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = ? 
            WHERE
                IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getMineConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getFishConsumables(address) {
        logger.debug(`getFishConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                item_consumable_fishing AS i_con_f 
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_f.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = ? 
            WHERE
                IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getFishConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRecipeConsumables(address) {
        logger.debug(`getRecipeConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                item_consumable_recipe AS i_con_rec 
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_rec.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = ? 
            WHERE
                IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysqlPvp.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async setInventoryTransfer(transferObject) {
        logger.info(`setInventoryTransfer start`);
        return new Promise((resolve, reject) => {
            let sql;
            let params = [
                transferObject.sender,
                transferObject.receiver,
                transferObject.id,
                transferObject.quantity,
                transferObject.senderBalanceBefore,
                transferObject.senderBalanceAfter,
                transferObject.receiverBalanceBefore,
                transferObject.receiverBalanceAfter
            ]

            sql = `
            INSERT INTO inventory_transfer (
                sender, 
                receiver, 
                ${transferObject.idName}, 
                quantity, 
                senderBalanceBefore, 
                senderBalanceAfter, 
                receiverBalanceBefore, 
                receiverBalanceAfter,
                transferTime
            ) VALUES (?,?,?,?,?,?,?,?, current_timestamp)`;


            mysqlPvp.query(sql, params, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setInventoryTransfer end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async setCraftHistory(craftObjects) {
        logger.debug('setCraftHistory start');

        let idx;
        let craftTime = new Date().toISOString().slice(0, -1);

        let craftObjectsArray = craftObjects.map(
            function (elem) {
                return [
                    elem.isGem,
                    elem.isNPC,
                    elem.address,
                    elem.inventoryType,
                    elem.idItem,
                    elem.idToolInstance,
                    elem.idRecipe,
                    elem.resourceType,
                    elem.requiredQuantity,
                    elem.quantityBefore,
                    elem.quantityAfter,
                    idx,
                    craftTime
                ]
            }
        )


        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO craft_history (
                isGem,
                isNPC,
                address,
                inventoryType,
                idItem,
                idGearInstance,
                idCard,
                idRecipe,
                resourceType,
                requiredQuantity,
                quantityBefore,
                quantityAfter,
                idx,
                craftTime
            ) VALUES ?`;


            mysqlPvp.query(sql, [craftObjectsArray], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('setCraftHistory end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getIdGearInstanceByAddressIdGearLevel(address, idGearLevel) {
        logger.debug(`getIdGearInstanceByAddressIdGearLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idGearInstance 
                FROM
                    gear_instance 
                WHERE
                    address = ? 
                    AND idGearLevel = ? 

                ORDER BY idGearInstance DESC
                `

            mysqlPvp.query(sql, [address, idGearLevel], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdGearInstanceByAddressIdGearLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idGearInstance)
                }
            })
        })
    }

    static async getIdCardInstanceByAddressIdCardLevel(address, idCardLevel) {
        logger.debug(`getIdCardInstanceByAddressIdCardLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardInstance 
                FROM
                    card_instance 
                WHERE
                    address = ? 
                    AND idCardLevel = ? 

                ORDER BY idCardInstance DESC
                `

            mysqlPvp.query(sql, [address, idCardLevel], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdCardInstanceByAddressIdCardLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idCardInstance)
                }
            })
        })
    }

    static async getIdGearLevelByIdRecipe(idRecipe) {
        logger.debug(`getIdGearLevelByIdRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idGearLevel 
                FROM
                    gear_level 
                WHERE
                    idGear = 
                    (
                        SELECT
                            idGear 
                        FROM
                            recipe 
                        WHERE
                            idRecipe = ?
                    )
                    AND level = 
                    (
                        SELECT
                            MIN(level) 
                        FROM
                            gear_level 
                        WHERE
                            idGear = 
                            (
                                SELECT
                                    idGear 
                                FROM
                                    recipe 
                                WHERE
                                    idRecipe = ?
                            )
                    )
                `

            mysqlPvp.query(sql, [idRecipe, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdGearLevelByIdRecipe end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idGearLevel)
                }
            })
        })
    }

    static async getIdCardLevelByIdRecipe(idRecipe) {
        logger.debug(`getIdCardLevelByIdRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardLevel 
                FROM
                    card_level 
                WHERE
                    idCard = 
                    (
                        SELECT
                            idCard 
                        FROM
                            recipe 
                        WHERE
                            idRecipe = ?
                    )
                    AND level = 
                    (
                        SELECT
                            MIN(level) 
                        FROM
                            card_level 
                        WHERE
                            idCard = 
                            (
                                SELECT
                                    idCard 
                                FROM
                                    recipe 
                                WHERE
                                    idRecipe = ?
                            )
                    )
                `

            mysqlPvp.query(sql, [idRecipe, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdCardLevelByIdRecipe end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idCardLevel)
                }
            })
        })
    }

    static async getIdGearLevelByIdGear(idGear) {
        logger.debug(`getIdGearLevelByIdGear start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idGearLevel 
                FROM
                    gear_level 
                WHERE
                    idGear = ?
                    AND level = 
                    (
                        SELECT
                            MIN(level) 
                        FROM
                            gear_level 
                        WHERE
                            idGear = ?
                    )
                `

            mysqlPvp.query(sql, [idGear, idGear], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdGearLevelByIdGear end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idGearLevel)
                }
            })
        })
    }

    static async getIdCardLevelByIdCard(idCard) {
        logger.debug(`getIdCardLevelByIdCard start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idCardLevel 
                FROM
                    card_level 
                WHERE
                    idCard = ?
                    AND level = 
                    (
                        SELECT
                            MIN(level) 
                        FROM
                            card_level 
                        WHERE
                            idCard = ?
                    )
                `

            mysqlPvp.query(sql, [idCard, idCard], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdCardLevelByIdCard end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idCardLevel)
                }
            })
        })
    }

    static async getResponseInventory(type, params) {
        logger.debug(`getResponseInventory start`)

        if (type == 'sendRecipe') {
            return new Promise((resolve, reject) => {
                let sql = `
                    SELECT
                        quantity 
                    FROM
                        recipe_instance 
                    WHERE
                        idRecipeInstance = ? 
                        AND address = ?
                    `

                mysqlPvp.query(sql, [params.idRecipeInstance, params.address], (err, rows) => {
                    if (err) reject(err)
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`)
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        logger.info(`getResponseInventory end`)
                        return resolve(JSON.parse(JSON.stringify(rows)))
                    }
                })
            })
        } else if (type == 'sendItem') {
            return new Promise((resolve, reject) => {
                let sql = `
                    SELECT
                        quantity 
                    FROM
                        item_instance 
                    WHERE
                        idItemInstance = ? 
                        AND address = ?
                    `

                mysqlPvp.query(sql, [params.idItemInstance, params.address], (err, rows) => {
                    if (err) reject(err)
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`)
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        logger.info(`getResponseInventory end`)
                        return resolve(JSON.parse(JSON.stringify(rows)))
                    }
                })
            })
        }
    }

    static async getGearInstanceData(idGearInstance) {
        logger.debug(`getGearInstanceData start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_lev.isUpgradable,
                    t_lev.percentageBuff,
                    t_lev.flatBuff,
                    t_lev.level,
                    t.name,
                    t.description,
                    t.image,
                    t.onCard,
                    t.onCategory,
                    m.craft,
                    m.view,
                    m.send,
                    m.sell 
                FROM
                    gear_instance AS t_ins 
                    JOIN
                        gear_level AS t_lev 
                        ON t_lev.idGearLevel = t_ins.idGearLevel 
                    JOIN
                        gear AS t 
                        ON t.idGear = t_ins.idGear 
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
                WHERE
                    t_ins.idGearInstance = ?
                `

            mysqlPvp.query(sql, idGearInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getGearInstanceData end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getCardInstanceData(idCardInstance) {
        logger.debug(`getCardInstanceData start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_lev.isUpgradable,
                    t_lev.hp,
                    t_ins.idCardInstance,
                    t_lev.attack,
                    t_lev.speed,
                    t_lev.range,
                    t_lev.level,
                    t.name,
                    t.description,
                    t.image,
                    t.category,
                    t.rarity,
                    m.craft,
                    m.view,
                    m.send,
                    m.sell 
                FROM
                    card_instance AS t_ins 
                    JOIN
                        card_level AS t_lev 
                        ON t_lev.idCardLevel = t_ins.idCardLevel 
                    JOIN
                        card AS t 
                        ON t.idCard = t_ins.idCard
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
                WHERE
                    t_ins.idCardInstance = ?
                `

            mysqlPvp.query(sql, idCardInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getCardInstanceData end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUser(address) {
        logger.info(`getUser start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM utente WHERE address = ?";

            mysqlPvp.query(sql, address, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeGivenIdRecipeInstance(address, idRecipeInstance) {
        logger.info(`getRecipeGivenIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe_instance WHERE idRecipeInstance = ? AND address = ?"

            mysqlPvp.query(sql, [idRecipeInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getRecipeGivenIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }


    static async getRecipeGivenIdRecipe(address, idRecipe) {
        logger.info(`getRecipeGivenIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe_instance WHERE address = ? AND idRecipe = ?";

            mysqlPvp.query(sql, [address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeGivenIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeFromIdRecipe(idRecipe) {
        logger.info(`getRecipeFromIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT 
                        r.idRecipe, r.name, r.image, r.description, r.rarity, r.chanceCraft, r.idGear,r.itemQuantity,r.category,
                        r.idCard, r.idItem, r.maxCraft, m.craft, m.view, m.send, m.sell,
                        c.image as cardImage , c.name as cardName,
                        g.image as gearImage , g.name as gearName,
                        i.image as itemImage , i.name as itemName
                    FROM 
                        recipe r
                    LEFT JOIN card c on c.idCard = r.idCard
                    LEFT JOIN gear g on g.idGear = r.idGear
                    LEFT JOIN item i on i.idItem = r.idItem
                    INNER JOIN
                        menu m 
                    ON
                        r.idMenu = m.idMenu 
                    WHERE idRecipe = ?
                `;

            mysqlPvp.query(sql, [idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeFromIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async getRecipeCraftRequirementsFromIdRecipe(idRecipe) {
        let sql = `
                SELECT 
                    *
                FROM 
                    craft_requirements cr
                WHERE cr.idRecipe = ?
        `;

        return await selectFromDB(sql, [idRecipe], 'InventoryQueries.getRecipeCraftRequirementsFromIdRecipe');
    }

    static async getItemRequirementsFromIdItemRequirement(idItemRequirement) {
        let sql = `
                SELECT 
                    ir.idItem, ir.quantityItem AS 'quantityToUpgrade', ir.burn, i.name, i.description, i.image, i.type, i.rarity 
                FROM item_requirements ir 
                INNER JOIN item i ON ir.idItem = i.idItem WHERE idItemRequirement = ?
        `;

        return await selectFromDB(sql, [idItemRequirement], 'InventoryQueries.getItemRequirementsFromIdItemRequirement');
    }

    static async getGearRequirementsFromIdGearRequirement(idGearRequirement) {
        let sql = `
                SELECT 
                    g.idGear, g.name, g.description, g.image, g.type, g.rarity,gr.burn, gl.level, gl.isUpgradable, gl.percentageBuff, gl.flatBuff, gl.buffAttribute
                FROM gear_requirements gr 
                LEFT JOIN 
                    gear_level gl 
                ON 
                    gr.idGearLevel = gl.idGearLevel
                LEFT JOIN 
                    gear g 
                ON 
                    g.idGear = gl.idGear 
                WHERE 
                    gr.idGearRequirement = ?
        `;

        return await selectFromDB(sql, [idGearRequirement], 'InventoryQueries.getGearRequirementsFromIdGearRequirement');
    }

    static async getPointsRequirementsFromIdPointsRequirement(idPointRequirement) {
        let sql = `
            SELECT 
                pr.quantity AS 'pointRequired', burn 
            FROM 
                point_requirements pr 
            WHERE 
                idPointRequirement = ?
        `;

        return await selectFromDB(sql, [idPointRequirement], 'InventoryQueries.getPointsRequirementsFromIdPointsRequirement');
    }

    static async getRecipeRequirementsFromIdPointsRequirement(idRecipeRequirement) {
        let sql = `
        SELECT 
            rr.idRecipe, rr.quantity AS 'quantity', rr.burn, r.name, r.description, r.image, r.rarity 
        FROM recipe_requirements rr 
        INNER JOIN recipe r ON rr.idRecipe = r.idRecipe WHERE idRecipeRequirement = ?
        `;

        return await selectFromDB(sql, [idRecipeRequirement], 'InventoryQueries.getRecipeRequirementsFromIdPointsRequirement');
    }

    static async getCardRequirementsFromIdCardRequirement(idCardRequirement) {
        let sql = `
            SELECT 
            c.idCard,c.name,c.description,c.image,c.category,c.rarity,cr.burn,cl.level,cl.attack,cl.speed,cl.range,cl.hp,cl.buffPercentage,cl.buffCategory,cl.buffAttribute,cl.chanceUpgrade,cl.isUpgradable
            FROM 
                card_requirements cr 
            LEFT JOIN card c ON c.idCard = cr.idCard
            LEFT JOIN card_level cl ON cl.idCardLevel = cr.idCardLevel
            WHERE 
                idCardRequirement = ?
        `;

        return await selectFromDB(sql, [idCardRequirement], 'InventoryQueries.getPointsRequirementsFromIdPointsRequirement');
    }


    static async getInstanceRequirementsFromAddressAndIdItem(address, idItem) {
        let sql = `
                SELECT 
                    ii.quantity AS 'itemQuantity', u.pvpPoints
                FROM 
                    item_instance ii
                INNER JOIN
                    user u 
                ON 
                    u.address = ii.address 
                WHERE 
                    ii.address = ? 
                AND ii.idItem = ?
                LIMIT 1
        `;

        return await selectFromDB(sql, [address, idItem], 'InventoryQueries.getInstanceRequirementsFromAddressAndIdItem');
    }

    static async subRecipe(address, idRecipeInstance, quantity) {
        logger.info(`subRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE recipe_instance
            SET quantity = CASE WHEN (quantity >= ?) THEN quantity - ? ELSE quantity END
            WHERE address = ? AND idRecipeInstance = ?`;

            mysqlPvp.query(sql, [quantity, quantity, address, idRecipeInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`subRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async newRecipe(address, idRecipe, quantity) {
        logger.info(`newRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `INSERT IGNORE INTO recipe_instance (address,idRecipe,quantity) VALUES (?,?,?)`;

            mysqlPvp.query(sql, [address, idRecipe, quantity], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addRecipes(address, idRecipe, quantity) {
        logger.info(`newRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `LOCK TABLE recipe_instance write;
            UPDATE recipe_instance
            SET quantity = quantity + ? 
            WHERE address = ? AND idRecipe = ?;
            UNLOCK TABLE;
             `;

            mysqlPvp.query(sql, [quantity, address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemGivenIdItemInstance(address, idItemInstance) {
        logger.info(`getItemGivenIdItemInstance start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item_instance WHERE address = ? AND idItemInstance = ?";

            mysqlPvp.query(sql, [address, idItemInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemGivenIdItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemGivenIdItem(address, idItem) {
        logger.info(`getItemGivenIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item_instance WHERE address = ? AND idItem = ?";

            mysqlPvp.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemGivenIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subItem(address, idItemInstance, quantity) {
        logger.info(`subItem start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE item_instance
            SET quantity = CASE WHEN (quantity >= ?) THEN quantity - ? ELSE quantity END
            WHERE address = ? AND idItemInstance = ?`;

            mysqlPvp.query(sql, [quantity, quantity, address, idItemInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`subItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addCraftedGear(address, idRecipe) {
        logger.info(`addCraftedGear start`);

        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE gear_instance (idGearLevel, idGear, address, equipped)
            VALUES (
                (SELECT idGearLevel FROM gear_level where idGear = (SELECT idGear FROM recipe WHERE idRecipe = ?)
                AND level = (select min(level) from gear_level where idGear = (SELECT idGear FROM recipe WHERE idRecipe = ?))),

                (SELECT idGear FROM recipe WHERE idRecipe = ?),

                ?,

                0
            )`;

            mysqlPvp.query(sql, [idRecipe, idRecipe, idRecipe, address, idRecipe, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addCraftedGear end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addCraftedCard(address, idRecipe) {
        logger.info(`addCraftedCard start`);

        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE card_instance (idCardLevel, idCard, address)
            VALUES (
                (SELECT idCardLevel FROM card_level where idCard = (SELECT idCard FROM recipe WHERE idRecipe = ?)
                AND level = (select min(level) from card_level where idCard = (SELECT idCard FROM recipe WHERE idRecipe = ?))),

                (SELECT idCard FROM recipe WHERE idRecipe = ?),

                ?
            )`;

            mysqlPvp.query(sql, [idRecipe, idRecipe, idRecipe, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addCraftedCard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addCraftedGearByIdGear(address, idGear) {
        logger.info(`addCraftedGear start`);

        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE gear_instance (idGearLevel, idGear, address, equipped)
            VALUES (
                (SELECT idGearLevel FROM gear_level where idGear = ?
                AND level = (select min(level) from gear_level where idGear = ?)),

                ?,

                ?,

                0
            )`;

            mysqlPvp.query(sql, [idGear, idGear, idGear, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addCraftedGear end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addCraftedCardByIdCard(address, idCard) {
        logger.info(`addCraftedCardByIdCard start`);

        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE card_instance (idCardLevel, idCard, address)
            VALUES (
                (SELECT idCardLevel FROM card_level where idCard = ?
                AND level = (select min(level) from card_level where idCard = ?)),

                ?,

                ?
            )`;

            mysqlPvp.query(sql, [idCard, idCard, idCard, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addCraftedCardByIdCard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }



    static async getRecipeDropType(idRecipe) {
        logger.info(`getRecipeDropType start`);

        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM recipe WHERE idRecipe = ?`;

            mysqlPvp.query(sql, idRecipe, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeDropType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async newItem(address, idItem, quantity) {
        logger.info(`newItem start`);
        return new Promise((resolve, reject) => {
            let sql = `INSERT IGNORE INTO item_instance (address,idItem,quantity) VALUES (?,?,?)`;

            mysqlPvp.query(sql, [address, idItem, quantity], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addItems(address, idItem, quantity) {
        logger.info(`addItems start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLE item_instance write;
            UPDATE item_instance
            SET quantity = quantity + ? 
            WHERE address = ? AND idItem = ?;
            UNLOCK TABLE`;

            mysqlPvp.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addItems end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async sendItemStatus(idItem) {
        logger.info(`sendItemStatus start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item JOIN menu ON item.idMenu = menu.idMenu WHERE idItem = ? ";

            mysqlPvp.query(sql, idItem, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`sendItemStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async sendRecipeStatus(idRecipe) {
        logger.info(`sendRecipeStatus start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe JOIN menu ON recipe.idMenu = menu.idMenu WHERE idRecipe = ? ";

            mysqlPvp.query(sql, idRecipe, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`sendRecipeStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async getCardGivenIdCardInstance(address, idCardInstance) {
        logger.info(`getCardGivenIdCardInstance start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM card_instance WHERE address = ? AND idCardInstance = ?";

            mysqlPvp.query(sql, [address, idCardInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getCardGivenIdCardInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getGearGivenIdGearInstance(address, idGearInstance) {
        logger.info(`getGearGivenIdGearInstance start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM gear_instance WHERE address = ? AND idGearInstance = ?";

            mysqlPvp.query(sql, [address, idGearInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getGearGivenIdGearInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async toolFakeProperty(idToolInstance) {

        console.log("DOVE SCAPPI PKD", serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idToolInstance)
        logger.info(`toolFakeProperty start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE tool_instance SET address = ?, equipped = 0, pkbuilding = null WHERE idToolInstance = ?";

            mysqlPvp.query(sql, [serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idToolInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`toolFakeProperty end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async cardFakeProperty(idCardInstance) {

        console.log("DOVE SCAPPI PKD", serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idCardInstance)
        logger.info(`cardFakeProperty start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE card_instance SET address = ?, weaponSlot = null,shieldSlot = null,talismanSlot = null  WHERE idCardInstance = ?";

            mysqlPvp.query(sql, [serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idCardInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`cardFakeProperty end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async gearFakeProperty(idGearInstance) {

        console.log("DOVE SCAPPI PKD", serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idGearInstance)
        logger.info(`gearFakeProperty start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE gear_instance SET address = ?, equipped = 0, pkcard = null WHERE idGearInstance = ?";

            mysqlPvp.query(sql, [serverConfig.marketplace.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idGearInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`gearFakeProperty end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getNPCRecipes() {
        logger.info(`InventoryQueries.getNPCRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe AS id, name, image, rarity, category,idGear,idCard,idItem
                FROM
                    recipe
                WHERE
                    NPC = TRUE
                `
            mysqlPvp.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNPCRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getPvpNPCRecipeInstance(address, idRecipe) {
        logger.info(`InventoryQueries.getPvpNPCRecipeInstance start`)

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    r.idRecipe AS 'id', r.name, r.image, r.description, r.chanceCraft,
                    m.craft, m.view, m.send, m.sell,
                    i.name AS 'itemName', i.image AS 'itemImage', r.itemQuantity,
                    rr.idRecipeRequirement, ir.idItemRequirement, gr.idGearRequirement,
                    g.name AS 'gearName', g.image AS 'gearImage', g.description AS 'gearDescription', g.type AS 'gearType',
                    IF(rr.quantity IS NULL, 0, rr.quantity) AS 'requiredRecipes',
                    IF(ir.quantityItem IS NULL, 0, ir.quantityItem) AS 'requiredItems',
                    IF(gl.level IS NULL, 0, gl.level) AS 'requiredGearLevel',
                    IF(IF(ri.quantity IS NULL, 0, ri.quantity) > IF(rr.quantity IS NULL, 0, rr.quantity), TRUE, FALSE) AS 'isRecipeAllowed',
                    IF(IF(ii.quantity IS NULL, 0, ii.quantity) > IF(ir.quantityItem IS NULL, 0, ir.quantityItem), TRUE, FALSE) AS 'isItemAllowed',
                    IF(gl.isUpgradable IS NULL, FALSE, TRUE) AS 'isGearAllowed'
                FROM 
                    recipe r 
                INNER JOIN
                    user u 
                ON
                    u.address = ?
                INNER JOIN
                    menu m 
                ON 
                    r.idMenu = m.idMenu
                INNER  JOIN 
                    item i 
                ON
                    r.idItem = i.idItem
                INNER  JOIN 
                    recipe_requirements rr 
                ON
                    rr.idRecipe = r.idRecipe
                INNER  JOIN 
                    item_requirements ir 
                ON
                    ir.idItem = i.idItem 
                INNER  JOIN
                    gear g 
                ON
                    r.idGear = g.idGear 
                INNER JOIN
                    gear_level gl 
                ON
                    gl.idGear = g.idGear 
                INNER JOIN 
                    gear_requirements gr 
                ON
                    gr.idGearLevel = gl.idGearLevel
                INNER JOIN
                    recipe_instance ri 
                ON
                    ri.address = ?
                AND 
                    ri.idRecipe = r.idRecipe
                INNER JOIN 
                    item_instance ii 
                ON
                    ii.address = ?
                AND 
                    ii.idItem = i.idItem 
                INNER JOIN
                    gear_instance gi 
                ON
                    gi.address = ?
                AND 
                    gi.idGearLevel = gl.idGearLevel 
                WHERE 
                    r.idRecipe = ?
                LIMIT 1
            `;

            mysqlPvp.query(sql, [address, address, address, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getPvpNPCRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        });
    }

    static async getLandNPCRecipes() {
        logger.info(`InventoryQueries.getLandNPCRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe AS id, name, image, rarity
                FROM
                    recipe
                WHERE
                    landNPC = TRUE
                `
            mysqlPvp.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getLandNPCRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async logChestOpening(info) {
        /*
            info = {
                address,
                idChest,
                lootNumber,
                idItem,
                idRecipe,
                quantityBefore,
                quantity,
                quantityAfter,
            };
        */
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO chest_history
            (address, idChest, lootNumber, idItem, idRecipe, quantityBefore, quantity, quantityAfter, timestamp)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

            mysqlPvp.query(sql,
                [
                    info.address,
                    info.idChest, info.lootNumber,
                    info.idItem, info.idRecipe,
                    info.quantityBefore, info.quantity, info.quantityAfter
                ], (err, rows) => {
                    if (err) reject(err);
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`);
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                });
        });
    }

    static async getGemRecipes() {
        logger.info(`InventoryQueries getGemRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe AS id, name, image, rarity, idGear, idItem,idCard
                FROM
                    recipe
                WHERE
                    gem = TRUE
                `
            mysqlPvp.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries getGemRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getBundleGem() {
        logger.info(`InventoryQueries getBundleGem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    b_gem.*,
                    i.name AS itemName, i.image AS itemImage, i.description AS itemDescription
                FROM
                    bundle_gems AS b_gem
                    JOIN item AS i
                    ON i.idItem = b_gem.idItem
                WHERE
                    b_gem.active = 1
                `
            mysqlPvp.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries getBundleGem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getGemRecipesInstance(address, idRecipe) {
        logger.info(`getGearQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            rec.idRecipe AS id,
            'recipe' AS type,
            rec.name, rec.image, rec.description, rec.chanceCraft,
            m.craft, m.view, m.send, m.sell,
            g.name AS productName, g.image AS productImage,
            r_i.name AS productName1, r_i.image AS productImage1,
            c.name AS productName2, c.image AS productImage2,
            rec.itemQuantity AS productQuantity,
               c_req.idPointRequirement, c_req.idItemRequirement, c_req.idGearRequirement, c_req.idRecipeRequirement, cr.idCardRequirement,
            IF(pr.quantity IS NULL, 0, pr.quantity) AS requiredPoints,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            IF(IF(pr.quantity IS NULL, 0, pr.quantity) > u.pvpPoints, FALSE, TRUE) AS isPointsAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name AS requiredItemName, i.image AS requiredItemImage,
            gr.burn, gi.idGearInstance,
            gl.level  AS requiredGearLevel,
            g2.name AS requiredGearName, g2.image AS requiredGearImage,
            IF(gi.idGearInstance IS NULL, FALSE, TRUE) AS isGearAllowed,
            cr.burn, ci.IdCardInstance,
            cl.level  AS requiredCardLevel,
            c2.name AS requiredCardName, c2.image AS requiredCardImage,
            IF(ci.IdCardInstance  IS NULL, FALSE, TRUE) AS isCardAllowed,
            r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
            IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
            IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
            r_rec_ins.idRecipeInstance 
        FROM
            recipe AS rec 
            JOIN
                \`user\` AS u 
                ON u.address = ?  
            JOIN
                menu AS m 
                ON m.idMenu = rec.idMenu 
            LEFT JOIN
                gear AS g 
                ON g.idGear = rec.idGear
            LEFT JOIN 
                card c 
                ON c.idCard = rec.idCard
            LEFT JOIN
                item AS r_i 
                ON r_i.idItem = rec.idItem 
            LEFT JOIN
                craft_requirements AS c_req 
                ON c_req.idRecipe = rec.idRecipe 
            LEFT JOIN
                point_requirements pr   
                ON pr.idPointRequirement  = c_req.idPointRequirement  
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = c_req.idItemRequirement 
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = ?
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
            LEFT JOIN
                gear_requirements gr   
                ON gr.idGearRequirement  = c_req.idGearRequirement  
            LEFT JOIN
                gear_level gl  
                ON gl.idGearLevel  = gr.idGearLevel 
            LEFT JOIN
                gear g2 
                ON g2.idGear = gl.idGear 
            LEFT JOIN
                gear_instance gi 
                ON gi.address = ? 
                AND gi.idGearLevel  = gr.idGearLevel  
            LEFT JOIN 
                card_requirements cr 
                ON cr.idCardRequirement = c_req.idCardRequirement 
            LEFT JOIN 
                card_level cl 
                ON cl.idCardLevel = cr.idCardLevel 
            LEFT JOIN 
                card c2 
            ON c2.idCard = cl.idCard 
            LEFT JOIN 
                card_instance ci
                ON ci.address = ?
                AND ci.idCardLevel = cr.idCardLevel 
            LEFT JOIN
                recipe_requirements AS rec_req 
                ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
            LEFT JOIN
                recipe AS r_rec 
                ON r_rec.idRecipe = rec_req.idRecipe 
            LEFT JOIN
                recipe_instance AS r_rec_ins 
                ON r_rec_ins.address = ?
                AND r_rec_ins.idRecipe = rec_req.idRecipe 
        WHERE
            rec.idRecipe = ?
            `;

            mysqlPvp.query(sql, [address, address, address, address, address , idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getGearQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}


module.exports = { InventoryQueries };