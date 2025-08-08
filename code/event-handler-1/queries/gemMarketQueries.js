const mysql = require('../config/databaseConfig');

class GemMarketQueries{

    static async makeClaimUnstake(resValues, type){
        return new Promise((resolve, reject) => {
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
            SET ${resourceType} = ${resourceType} + (
                SELECT FLOOR(stored) 
                FROM buildings as b1
                WHERE b1.idBuilding = ?
                AND b1.type = ?)
            WHERE address = ?;
            
            UPDATE buildings as b3
            SET stored = stored - FLOOR(stored) 
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
            let secondSql = "SELECT `stored`, lastClaim, dropQuantity, dropInterval, capacity FROM buildings WHERE idBuilding = ?";

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

    
    static async addMarketHistory(idBundleGems, buyer, quantity, price, transaction_hash) {
        console.log(`addMarketHistory start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO bundle_gems_history
                    (idBundleGems, address, quantity, price, transaction_hash, purchaseTime)
                VALUES
                    (?, ?, ?, ?, ?, current_timestamp)
                
                `
            mysql.query(sql, [idBundleGems, buyer, quantity, price, transaction_hash], (err, rows) => {
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

    
    static async getBundleByIndex(index) {
        console.log(`getBundleByIndex start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM bundle_gems as bg
            WHERE bg.idBundleGems = ?
                `;
            mysql.query(sql, [index], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    console.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    console.log(`getBundleByIndex END`)
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
}

module.exports = { GemMarketQueries }