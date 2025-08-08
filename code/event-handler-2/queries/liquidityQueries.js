//LIBRARIES

//ABIs

//CONFIG
const mysql = require('../config/databaseConfig');

//SERVICES

//INIT

class LiquidityQueries {
    constructor(){}

    static async increaseLiquidity(address, liquidity){
        console.log(`increaseLiquidity [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                INSERT INTO liquidity
                    (address, liquidity)
                VALUES 
                    (?, ?)
                ON DUPLICATE KEY
                UPDATE liquidity = liquidity + ?
                `;
                mysql.query(sql, [address, liquidity, liquidity], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`increaseLiquidity [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async decreaseLiquidity(address, liquidity){
        console.log(`decreaseLiquidity [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                UPDATE liquidity
                SET liquidity = IF(liquidity - ? < 0, 0 , liquidity - ?)
                WHERE address = ?
                `;
                mysql.query(sql, [liquidity, liquidity, address], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`decreaseLiquidity [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async getLiquidityAndActualMinByAddress(address){
        console.log(`getLiquidityAndActualMinByAddress [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                SELECT * 
                FROM blessings as b
                JOIN blessings_rewards as br 
                ON 
                    br.idBlessingsRewards = b.idBlessingsRewards
                JOIN liquidity as l
                ON
                    l.address = b.address
                WHERE 
                    b.status = 'running'
                AND 
                    b.blessingEndingTime > current_timestamp
                AND 
                    b.address = ?
                `;
                mysql.query(sql, [address], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`getLiquidityAndActualMinByAddress [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async changeBlessingStatus(id, status){
        console.log(`changeBlessingStatus [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                UPDATE blessings
                SET status = ?,
                liquidityRemoved = true,
                blessingDoneTime = current_timestamp
                WHERE idBlessings = ?
                `;
                mysql.query(sql, [status, id], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`changeBlessingStatus [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async addTransactionHash(transactionHash, type){
        console.log(`addTransactionHash [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                INSERT IGNORE INTO history_transaction_hash
                    (transactionHash, type)
                VALUES
                    (?, ?)
                `;
                mysql.query(sql, [transactionHash, type], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`addTransactionHash [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async addTransferHash(transactionHash, type){
        console.log(`addTransferHash [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                INSERT IGNORE INTO history_transfer_hash
                    (transactionHash, type)
                VALUES
                    (?, ?)
                `;
                mysql.query(sql, [transactionHash, type], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`addTransferHash [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
    
    static async resetLiquidity(address){
        console.log(`resetLiquidity [START]`);
            return new Promise((resolve, reject) => {
                let sql = `
                UPDATE liquidity
                SET liquidity = 0
                WHERE address = ?
                `;
                mysql.query(sql, [address], (err, rows) => {
                    if(err) return reject(err);
                    if(rows == undefined){
                        console.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        console.log(`resetLiquidity [END]`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                })
            });
    }
}

module.exports = {
    LiquidityQueries
}