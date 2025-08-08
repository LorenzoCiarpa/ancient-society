const {mysql} = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class VoucherQueries{
    static async createVoucher(){
        logger.info(`createVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO voucher_referal
                    (status)
                VALUES
                    ('created')
            `;
    
            mysql.query(sql, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async generatePendingVoucher(address, quantity, blockNumber){
        logger.info(`generatePendingVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO vouchers
                    (address, quantity, blockNumber, type, status, pendingTime)
                VALUES
                    (?, ?, ?, 1, 'pending', current_timestamp)
            `;
    
            mysql.query(sql, [address, quantity, blockNumber], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`generatePendingVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getCreatedOrPendingVouchersByAddress(address){
        logger.info(`getCreatedOrPendingVouchersByAddress start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM vouchers WHERE address = ? AND type = 1 AND (status = 'pending' or status = 'created')";
            mysql.query(sql, [address], (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`); 
                    return reject(err);
                }
                logger.info(`getCreatedVouchersGivenAddressTypeStatus end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    static async updateCreatedVoucher(voucher){
        logger.info(`updateCreatedVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                voucher_contract
            SET 
                owner = ?,
                blockNumber = ?,
                signature = ?,
                quantity = ?,
                createTime = current_timestamp
            WHERE
                idVoucherContract = ?

            `;

            let params = [
                voucher.owner,
                voucher.blockNumber,
                voucher.signature,
                voucher.quantity,
                voucher.id
            ];
    
            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`updateCreatedVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getLastDayVouchersSum(address){
        logger.info(`getLastDayVouchersSum start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT sum(quantity) as somma
                FROM vouchers 
                WHERE address = ?
                AND pendingTime >= subdate(current_timestamp, interval 1 day)
            `;

            let params = [
                address
            ];
    
            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getLastDayVouchersSum end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    
}

class VoucherContractQueries{
    static async createVoucher(){
        logger.info(`createVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO voucher_contract
                    (status)
                VALUES
                    ('created')
            `;

            mysql.query(sql, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateCreatedVoucher(voucher){
        logger.info(`updateCreatedVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                voucher_contract
            SET 
                idContract = ?,
                owner = ?,
                blockNumber = ?,
                signature = ?,
                creation = ?,
                expireTime = ?,
                fee = ?,
                createTime = current_timestamp
            WHERE
                idVoucherContract = ?
            `;

            let params = [
                voucher.idContract,
                voucher.owner,
                voucher.blockNumber,
                voucher.signature,
                voucher.creation,
                voucher.expireTime,
                voucher.fee,
                voucher.id
            ];

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`updateCreatedVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


}

class VoucherFarmerQueries{
    static async createVoucher(){
        logger.info(`createVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO vouchers_farmer
                    (status)
                VALUES
                    ('created')
            `;

            mysql.query(sql, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTokensAllowed(address){
        logger.info(`getTokensAllowed start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * 
                FROM farmer_allowance
                WHERE address = ?
            `;

            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getTokensAllowed end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    

    static async updateCreatedVoucher(voucher){
        logger.info(`updateCreatedVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                vouchers_farmer
            SET 
                address = ?,
                blockNumber = ?,
                quantity = ?,
                signature = ?,
                createTime = current_timestamp
            WHERE
                id = ?
            `;

            let params = [
                voucher.owner,
                voucher.quantity,
                voucher.blockNumber,
                voucher.signature,
                voucher.id
            ];

            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`updateCreatedVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getCreatedOrPendingVouchersByAddress(address){
        logger.info(`getCreatedOrPendingVouchersByAddress start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM vouchers_farmer WHERE address = ? AND (status = 'pending' or status = 'created')";
            mysql.query(sql, [address], (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`); 
                    return reject(err);
                }
                logger.info(`getCreatedVouchersGivenAddressTypeStatus end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

}

module.exports = {VoucherQueries, VoucherContractQueries, VoucherFarmerQueries}
