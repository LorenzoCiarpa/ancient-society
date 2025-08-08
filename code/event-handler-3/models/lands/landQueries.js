const mysql = require('../../config/databaseConfig');

class LandQueries{
    constructor(){}

    static async changeOwnership(idLand, newAddress){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let secondSql = "UPDATE lands SET address = ? WHERE idLand = ?";
            
            mysql.query(secondSql, [newAddress, idLand], (err, rows) => {
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

    static async changeOwnershipInstance(idLand, newAddress){
        return new Promise((resolve, reject) => {
            // let secondSql = "INSERT INTO buildings (type, level, name, description, stake, capacity, dropQuantity, dropInterval, imageURL, address, idBuilding, moreInfo, upgradeStatus, endingTime, upgradeFirstLogin, stored, lastClaim, bundle) VALUES (?, 1, TH, Descr, 0, 1000, 25, 3600, https://provaletturaimage.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif, ?, ?, moreInfo, 0, 2022-01-01 00:00:00.000000, 0, 0, 2022-01-01 00:00:00.000000, 0)";
            let secondSql = `UPDATE land_instance SET address = ? WHERE idLandInstance = ?`;
            
            mysql.query(secondSql, [newAddress, idLand], (err, rows) => {
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


}

module.exports = {LandQueries}