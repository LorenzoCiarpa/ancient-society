const mysql = require('../config/databaseConfig');

class BrokenMarketQueries{

    static async fly(id, owner){
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE land_instance 
            SET address = ?
            WHERE idLandInstance = ?;
            
            UPDATE lands
            SET address = ?
            WHERE idLand = ?;
            `;
    
            mysql.query(sql,  [owner, id, owner, id], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });

    }

    
    static async setRandomTrait(id, skin){
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE INTO inventario
                (idBuilding, idSkin)
            VALUES
                (?, ?)
            `;
    
            mysql.query(sql,  [id, skin], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });

    }


    static async makeClaimUnstake(resValues, type){
        return new Promise((resolve, reject) => {
            type = parseInt(type);
            console.log("type in claim: ", type)
            let resourceType;
            switch(type){
                case 1:
                    resourceType = 'ancien'
                    break;
                case 2:
                    resourceType = 'wood'
                    break;
                case 3:
                    resourceType = 'stone'
                    break;
                default:
                    break;

            }
            let sql = `
            LOCK TABLES utente WRITE, buildings as b1 WRITE, buildings as b3 WRITE;

            UPDATE utente
            SET ${resourceType} = ${resourceType} + (`
                + " SELECT FLOOR(`stored`) " +`
                FROM buildings as b1
                WHERE b1.idBuilding = ?
                AND b1.type = ?)
            WHERE address = ?;
            
            UPDATE buildings as b3`
            + " SET `stored` = `stored` - FLOOR(`stored`) " +`
            WHERE idBuilding = ?
            AND type = ?;
            
            UNLOCK TABLES;`
            
            mysql.query(sql, [resValues.tokenId, type, resValues.owner, resValues.tokenId, type], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    static async setStakeQuery(resValues, stake, newPosition){
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE buildings 
            SET position = ?, 
            stake = ?, 
            lastClaim = current_timestamp,
            lastClaimAction = current_timestamp,
            upgradeStatus = 0, 
            idToolInstance = NULL 
            WHERE idBuilding = ?`;
    
            mysql.query(sql, [newPosition, stake, resValues.tokenId], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    static async getStakedNFT(address){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM buildings
            WHERE address = ? AND stake = 1`;

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getStakedBuildings: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async unequipTool(idBuilding){
        console.log("idBuilding: ", idBuilding)
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE tool_instance 
            SET equipped = false,
            pkBuilding = null
            WHERE idToolInstance = (SELECT idToolInstance FROM buildings WHERE idBuilding = ?);`;
    
            mysql.query(sql, [idBuilding], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    

    static async getLastClaim(id){
        return new Promise((resolve, reject) => {
            let secondSql = "SELECT `stored`, lastClaim, dropQuantity, dropInterval, capacity FROM buildings  WHERE idBuilding = ?";

            mysql.query(secondSql, [id], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async updateStoredResources(newStored, id, newLastClaim){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET `stored` = ?, lastClaim = ? WHERE idBuilding = ?";

            mysql.query(sql, [newStored, newLastClaim, id], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    resolve({ affectedRows: rows,
                        newStored: newStored
                    });
                }
            });

        });
    }
    
   

    static async changeBusyFishermanSpot(address, newPosition){
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE buildings 
            SET position = ? 
            WHERE address = ?
            AND stake = 1
            AND position = 7`;
    
            mysql.query(sql, [newPosition, address, newPosition], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    
    static async addMarketHistory(indexPurchase, buyer, idBrokenMarketplace, quantity, transaction_hash) {
        console.log(`addMarketHistory start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO broken_marketplace_history
                    (indexPurchase, address, idBrokenMarketplace, quantity, transaction_hash, purchaseTime)
                VALUES
                    (?, ?, ?, ?, ?, current_timestamp)
                
                `
            mysql.query(sql, [indexPurchase, buyer, idBrokenMarketplace, quantity, transaction_hash], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`addMarketHistory END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    
    static async getOfferListByIndexOffer(idOffer) {
        console.log(`getOfferListByIndexOffer start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
            bm.name as marketName, bm.description as marketDescription, bm.image as marketImage,
            bmo.*
            
            FROM broken_marketplace as bm
            JOIN broken_marketplace_offer as bmo
                ON bmo.idBrokenMarketplace = bm.idBrokenMarketplace
            WHERE bm.idBrokenMarketplace = ?
            AND bm.active = true
                `;
            mysql.query(sql, [idOffer], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getOfferListByIndexOffer END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getReferalActive(address) {
        console.log(`getReferalActive start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
                ri.*, 
                rr.idItem, rr.quantity, rr.idItemPoint, 
                bm.price
            FROM referal_instance AS ri
            JOIN referal_reward AS rr
                ON rr.idReferalReward = ri.idReferalReward
            JOIN broken_marketplace as bm
                ON bm.idBrokenMarketplace = rr.idBrokenMarketplace
            WHERE 
                address = ?
            AND 
                rewarded = 0
            ORDER BY idReferalInstance DESC
            `;
            mysql.query(sql, [address], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getReferalActive END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async dropReferalReward(
        address, 
        idItem, 
        quantity, 
        addressReferal, 
        idItemPoint, 
        price,
        idReferalInstance
    ) {
        console.log(`getReferalActive start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO item_instance
                    (address, idItem, quantity)
                VALUES
                    (?, ?, ?)
                ON DUPLICATE KEY
                UPDATE 
                    quantity = quantity + ?;
                
                INSERT INTO item_instance
                    (address, idItem, quantity)
                VALUES
                    (?, ?, ?)
                ON DUPLICATE KEY
                UPDATE 
                    quantity = quantity + ?;
                
                UPDATE 
                    referal_instance
                SET
                    rewarded = 1,
                    rewardTime = current_timestamp
                WHERE  
                    idReferalInstance = ?

                
            `;

            let params = [
                address, 
                idItem, 
                quantity, 
                quantity, 
                addressReferal, 
                idItemPoint, 
                price, 
                price,
                idReferalInstance
            ]

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getReferalActive END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    
    static async getToolInfo(idToolLevel) {
        console.log(`getToolInfo start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT idTool, durabilityTotal
                FROM tool_level
                WHERE idToolLevel = ?
                `
            mysql.query(sql, [idToolLevel], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getToolInfo END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async dropItem(buyer, idItem, quantity) {
        console.log(`dropItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO item_instance
                    (address, idItem, quantity)
                VALUES
                    (?, ?, ?)
                ON DUPLICATE KEY
                    UPDATE quantity = quantity + ? 
                `
            mysql.query(sql, [buyer, idItem, quantity, quantity], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`dropItem END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async dropRecipe(buyer, idRecipe, quantity) {
        console.log(`dropRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO recipe_instance
                    (address, idRecipe, quantity)
                VALUES
                    (?, ?, ?)
                ON DUPLICATE KEY
                    UPDATE quantity = quantity + ? 
                `
            mysql.query(sql, [buyer, idRecipe, quantity, quantity], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`dropRecipe END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async dropTool(buyer, idToolLevel, idTool, durability) {
        console.log(`dropTool start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO tool_instance
                    (address, idToolLevel, idTool, durability, equipped)
                VALUES
                    (?, ?, ?, ?, 0)
                
                `
            mysql.query(sql, [buyer, idToolLevel, idTool, durability], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`dropTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUpgradeById(idUpgrade) {
        console.log(`getUpgradeById start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM upgrade
                WHERE id = ?
                `
            mysql.query(sql, [idUpgrade], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getUpgradeById END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async airdropUpdate(buyer, idUpgrade, transaction_hash, quantity) {
        console.log(`airdropUpdate start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO airdrop_broken_history 
                    (address, idUpgrade, transaction_hash, dropTime)
                VALUES
                    (?, ?, ?, current_timestamp)
                `
            mysql.query(sql, [buyer, idUpgrade, transaction_hash], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`airdropUpdate END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }



    //Transfer
    static async getBuilding(tokenId){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE idBuilding = ?";
    
            mysql.query(sql, tokenId, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined || null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getUser(address){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM utente WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined || null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async createUser(address){
        return new Promise((resolve, reject) => {
            let secondSql = "INSERT IGNORE INTO utente (address, nickname, ancien, wood, stone) values (?, null, 0, 0, 0)";
            mysql.query(secondSql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
        
    }

    static async changeOwnership(nftId, newAddress){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let secondSql = `
            UPDATE buildings 
                SET address = ? 
            WHERE 
                idBuilding = ?
            `;
            
            mysql.query(secondSql, [newAddress, nftId], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", newAddress);
                    return reject({
                        message: "undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async changeOwnershipBasicRod(newAddress, nftId){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let firstSql = `
            UPDATE buildings
            SET idToolInstance = null
            WHERE idToolInstance = (SELECT * FROM (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?) AS temp);

            UPDATE tool_instance 
            SET address = ?,
            equipped = 0,
            pkBuilding = null
            WHERE idToolInstance = (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?);`
            ;

            let paramsfirst = [nftId, newAddress, nftId]

            let secondSql = `
            UPDATE tool_instance 
            SET address = ?
            WHERE idToolInstance = (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?);`
            ;

            let paramsSecond = [newAddress, nftId]

            
            mysql.query(firstSql, paramsfirst, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", newAddress);
                    return reject({
                        message: "undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    //Mint

    static async getUpgradeBytypeAndLevel(type, level) {
        console.log(`getUpgradeBytypeAndLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM upgrade
                WHERE type = ?
                AND level = ?
                `
            mysql.query(sql, [type, level], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getUpgradeBytypeAndLevel END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    
    static async mintBuilding(
        address, 
        type, 
        level, 
        idBuilding, 
        name, 
        description, 
        capacity, 
        dropQuantity
        ) {
        console.log(`mintBuilding start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO buildings
                    (
                        address, 
                        type, 
                        level, 
                        idBuilding, 
                        name, 
                        description, 
                        capacity, 
                        dropQuantity)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?)
                `;
            let params = [
                address, 
                type, 
                level, 
                idBuilding, 
                name, 
                description, 
                capacity, 
                dropQuantity
            ];

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`mintBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async mintBasicRod(
        address
        ) {
        console.log(`mintBasicRod start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO tool_instance
                    (
                        idToolLevel, 
                        idTool, 
                        address, 
                        durability,
                        equipped
                    )
                VALUES
                    (400, 400, ?, -1, 0)
                `;
            let params = [
                address
            ];

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`mintBasicRod END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async addBasicTool(
        pkBuilding,
        idBasicRod
        ) {
        console.log(`addBasicTool start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    buildings
                SET 
                    idBasicTool = ?
                WHERE 
                    id = ?
                `;
            let params = [
                idBasicRod,
                pkBuilding
            ];

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`addBasicTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async mintVoucher(resValues, status){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ?, mintTime = current_timestamp WHERE id = ?";

            mysql.query(sql, [status, resValues.id], (err, rows) => {
                if(err) return reject(err);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

}

module.exports = { BrokenMarketQueries }