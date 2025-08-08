const mysql = require('../../config/databaseConfig');

class StakerService{
    constructor() {}
    
    
    
    async makeClaimUnstake(resValues, type){
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
            let sql = "LOCK TABLES utente WRITE, buildings as b1 WRITE, buildings as b3 WRITE;"
            + "UPDATE utente SET " + `${resourceType} = ${resourceType}` + " + (SELECT FLOOR(`stored`) FROM buildings as b1 WHERE b1.idBuilding = ? AND b1.type = ?) WHERE address = ?;"
            + "UPDATE buildings as b3 SET `stored` = `stored` - FLOOR(`stored`) WHERE idBuilding = ? AND type = ?;" 
            + "UNLOCK TABLES;"
            
            mysql.query(sql, [resValues.tokenId, type, resValues.owner, resValues.tokenId, type], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async setStakeQuery(resValues, type, stake, newPosition){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET position = ?, stake = ?, lastClaim = ?, upgradeStatus = 0, idToolInstance = NULL WHERE idBuilding = ? AND type = ?";
    
            mysql.query(sql, [newPosition, stake, resValues.lastClaim, resValues.tokenId, type], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async setIsOldContract(tokenId, type, isOldStakerContract){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET isOldStakerContract = ? WHERE idBuilding = ? AND type = ?";
    
            mysql.query(sql, [isOldStakerContract, tokenId, type], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null) reject(new Error("rows undefined or null"));
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async getStakedNFT(address){
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

    async getStakedNFTByType(address, type){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM buildings
            WHERE address = ? 
            AND type = ? 
            AND stake = 1`;

            mysql.query(sql, [address, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getStakedNFTByType: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getOwnerByIdAndType(idBuilding, type){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM buildings
            WHERE idBuilding = ? AND type = ?`;

            mysql.query(sql, [idBuilding, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getOwnerByIdAndType: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async unequipTool(idBuilding, type){
        console.log("idBuilding, type: ", idBuilding, type)
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE tool_instance 
            SET equipped = false,
            pkBuilding = null
            WHERE idToolInstance = (SELECT idToolInstance FROM buildings WHERE idBuilding = ? AND type = ?);`;
    
            mysql.query(sql, [idBuilding, type], (err, rows) => {
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

    isPositionUsed(nfts, position){
        for(let nft of nfts){
            if(nft.position == position) return true;
        }
        return false;
    }
    
    arePositionFishermanFree(nfts){
        // let newNfts = nfts.filter( nft => nft.position == 6 || nft.position == 7 )
        let positions = [];
        for(let nft of nfts){
            positions.push(nft.position);
        }

        if( positions.includes(8) && positions.includes(7)) return { success: false }  //none is free
        if( positions.includes(8) ) return {success: true, position: 7};
        if( positions.includes(7) ) return {success: true, position: 8};
        return {success: true, position: 7};  //both are free
    }

    async changeBusyFishermanSpot(address, newPosition){
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
}

class DropService {
    constructor() {}

    async getLastClaim(id, type){
        return new Promise((resolve, reject) => {
            let secondSql = "SELECT `stored`, lastClaim, dropQuantity, dropInterval, capacity FROM buildings WHERE idBuilding = ? AND type = ?";
            mysql.query(secondSql, [id, type], (err, rows) => {
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

    async updateStoredResources(newStored, id, type, newLastClaim){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET `stored` = ?, lastClaim = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [newStored, newLastClaim, id, type], (err, rows) => {
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

    async calculateNewStoredResources(id, type){
        // console.log("entrato calculateNewStore");
        try{
            let lastClaimResponse = await this.getLastClaim(id, type);


            let lastClaimSeconds = (new Date(lastClaimResponse.lastClaim).getTime()) / 1000;
            // console.log("lastClaimSeconds: ", lastClaimSeconds);
            let stored = lastClaimResponse.stored;
            let dropQuantity = lastClaimResponse.dropQuantity;
            let dropInterval = lastClaimResponse.dropInterval;
            let capacity = lastClaimResponse.capacity;

            let dropPerSecond = dropQuantity / dropInterval;

            let newClaimSeconds = (new Date().getTime()) / 1000;
            // console.log("newClaimSeconds: ", newClaimSeconds);



            let intervalsFromLastClaim = (newClaimSeconds - lastClaimSeconds);
            let increment = intervalsFromLastClaim * dropPerSecond;

            // console.log("id, type: ", id, type);
            // console.log("dropQuantity: ", dropQuantity);
            // console.log("intervalsFromLastClaimMinutes: ", intervalsFromLastClaim/60);
            // console.log("increment: ", increment);
            // console.log();


            if(increment < 0) return false;

            let newStored = stored + increment;
            if(newStored > capacity) newStored = capacity;

            let newLastClaim = new Date().toISOString().slice(0, -1);

            let response = await this.updateStoredResources(newStored, id, type, newLastClaim);
            return response;


        }catch(error){
            return error;
        }

    }
}

module.exports = {StakerService, DropService}