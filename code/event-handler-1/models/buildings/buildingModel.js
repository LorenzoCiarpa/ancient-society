const mysql = require('../../config/databaseConfig');
const {FISHERMAN, MINER, FARMER, BUILDING} = require('../../config/percentageTraits')
const random = require('random');

class BuildingService{
    constructor(){}

    async changeOwnership(nftId, type, newAddress){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let secondSql = "UPDATE buildings SET address = ? WHERE idBuilding = ? AND type = ?";
            
            mysql.query(secondSql, [newAddress, nftId, type], (err, rows) => {
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

    async changeOwnershipBasicRod(newAddress, nftId, type){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let firstSql = `
            UPDATE buildings
            SET idToolInstance = null
            WHERE idToolInstance = (SELECT * FROM (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?
                                    AND type = ?) AS temp);

            UPDATE tool_instance 
            SET address = ?,
            equipped = 0,
            pkBuilding = null
            WHERE idToolInstance = (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?
                                    AND type = ?);`
            ;

            let paramsfirst = [nftId, type, newAddress, nftId, type]

            let secondSql = `
            UPDATE tool_instance 
            SET address = ?
            WHERE idToolInstance = (SELECT idBasicTool 
                                    FROM buildings
                                    WHERE idBuilding = ?
                                    AND type = ?);`
            ;

            let paramsSecond = [newAddress, nftId, type]

            
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

    async getUpgradeBytypeAndLevel(type, level) {
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

    async mintBuilding(
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
                        dropQuantity,
                        stake,
                        upgradeStatus,
                        endingTime,
                        upgradeFirstLogin,`
                        + " `stored`, " 
                        + `lastClaim,
                        lastClaimAction,
                        position
                    )
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, current_timestamp, 0, 0, current_timestamp, current_timestamp, 0)
                `;

            let sqlProcedure = 'call mintBuilding(?,?,?,?,?,?,?,?);' 

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

            mysql.query(sqlProcedure, params, (err, rows) => {
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

    async mintBasicRod(
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
                    (401, 401, ?, -1, 0)
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

    async mintBasicHoe(
        address
        ) {
        console.log(`mintBasicHoe start`)
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
                    (422, 402, ?, -1, 0)
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

    async addBasicTool(
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

    async setRandomTrait(id, type){
        let TRAITS = BUILDING;
        if(type == 4) TRAITS = FISHERMAN;
        if(type == 5) TRAITS = MINER;
        if(type == 6) TRAITS = FARMER;

        let randomNumber = random.int(0, 10000);

        let baseNumber = 0;
        let trait_probability = TRAITS.trait_probability;
        let skins = TRAITS.skins;
        
        let skin = skins[skins.length - 1];

        let responseSetTrait;

        for(let i = 0; i < trait_probability.length; i++){
            baseNumber += trait_probability[i];
            if(baseNumber >= randomNumber){
                skin = skins[i];
                break;
            }
        }

        try{
            responseSetTrait = await this.setRandomTraitInventory(id, skin);
        }catch(error){
            console.log("Error in this.setRandomTraitInventory: ", error);
            throw error;
        }

        return responseSetTrait;
    }

    async getBuilding(tokenId, type){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE idBuilding = ? AND type = ?";
    
            mysql.query(sql, [tokenId, type], (err, rows) => {
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

    async setRandomTraitInventory(id, skin){
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
    
    async changeImageBundle(nftId, type, newImage){
        return new Promise((resolve, reject) => {
            let secondSql = "UPDATE buildings SET imageURL = ?, bundle = 1 WHERE idBuilding = ? AND type = ?";
            mysql.query(secondSql, [newImage, nftId, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    getImageBundleUrlPrerevealGivenIdAndType(id, type){
        switch(type){
            case 1:
                return "https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/townhall/BUNDLE-TH-PREREVEAL.gif";
            case 2:
                return "https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/BUNDLE-LJ-PREREVEAL.gif";
            case 3:
                return "https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/stonemine/BUNDLE-SM-PREREVEAL.gif";
            case 4: 
                return "https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/fisherman/BUNDLE-FM-PREREVEAL.gif";
            default:
                return null
        }
    }

    async createUser(address){
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

    async getUser(address){
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


}

module.exports = {BuildingService}