const mysql = require('../../config/databaseConfig');

class LandQueries{
    constructor () {}
    async setStakeQuery(id, stake){
        return new Promise((resolve, reject) => {
            let secondSql = "UPDATE land_instance SET stake = ? WHERE idLandInstance = ?";
            mysql.query(secondSql, [stake, id], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getStorageLand(id, address){
        return new Promise((resolve, reject) => {
            let secondSql = `SELECT * 
            FROM land_instance 
            LEFT JOIN land on land_instance.idLand = land.idLand 
            WHERE idLandInstance = ? AND address = ?`;
            mysql.query(secondSql, [id, address], (err, rows) => {
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

    async landClaimUnstake(idLandInstance,type, address){
        return new Promise((resolve, reject) => {
            let resourceType;
            switch(type){
                case 'forest':
                    resourceType = 'wood'
                    break;
                case 'mountain':
                    resourceType = 'stone'
                    break;
                default:
                    break;

            }
            let secondSql =`
            LOCK TABLES utente WRITE, land_instance as l1 WRITE, land_instance as l2 WRITE;

            UPDATE utente
            SET ${resourceType} = ${resourceType} + (
                SELECT FLOOR(storage) 
                FROM land_instance as l1
                WHERE l1.idLandInstance = ?)
            WHERE address = ?;
            
            UPDATE land_instance as l2
            SET storage = storage - FLOOR(storage) 
            WHERE idLandInstance = ?;
            
            UNLOCK TABLES;`;
            mysql.query(secondSql, [idLandInstance,address,idLandInstance], (err, rows) => {
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

    async getStakedLand(address){
        return new Promise((resolve, reject) => {
            let secondSql = "SELECT * FROM land_instance WHERE address = ? and stake = 1";
            mysql.query(secondSql, [address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports={LandQueries}