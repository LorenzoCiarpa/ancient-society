const mysql = require('../../config/databaseConfig');
const {serverConfig} = require('../../config/web3Config')
const {LandQueries} = require('./landQueries');

class LandService{
    async setVoucherStatus(owner,idContract,creation){
        return new Promise((resolve, reject) => {
            
            let sql = `
            UPDATE voucher_contract SET status = 'minted' WHERE idContract = ? AND creation = ? AND owner = ? ;
            
            
            
            `
            
            mysql.query(sql, [idContract,creation,owner ], (err, rows) => {
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

    async setContractStatus(owner, idContract,status){
        return new Promise((resolve, reject) => {
            
            let sql = `
            UPDATE land_contract
            SET contractStatus = ? 
            WHERE idContract = ? AND address = ?;            
            `
            
            mysql.query(sql, [status,idContract, owner], (err, rows) => {
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

    async removeContractLandInstance(owner, idContract){
        return new Promise((resolve, reject) => {
            
            let sql = `
            UPDATE land_instance
            SET idContract = null
            WHERE idContract = ? AND address = ?;            
            `
            
            mysql.query(sql, [idContract, owner], (err, rows) => {
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

    async transferLand(event){
        console.log("event transferLand: ", event);
        console.log("");
        console.log("");
        console.log("");
        let from = event.returnValues.from;
        let to = event.returnValues.to;
        let tokenId = event.returnValues.tokenId;
        let user;
        let response;

        console.log("tokenId: ", tokenId);
        console.log("from: ", from);
        console.log("to: ", to);

        if(from == serverConfig.chain.contracts.STAKER_LAND_ADDRESS.trim() || to == serverConfig.chain.contracts.STAKER_LAND_ADDRESS.trim()){
            console.log("from or to staking contract");
            console.log("from: ", from);
            console.log("to: ", to);
            return;
        }
	
        try{
            user = await LandQueries.getUser(to);
            if(user.length == 0){
                response = await LandQueries.createUser(to);
                console.log("creation of user: ", to, " response: ", response);
            }

            response = await LandQueries.changeOwnership(tokenId, to);
            console.log("response changeOwnership land: ", response);

            response = await LandQueries.changeOwnershipInstance(tokenId, to);
            console.log("response changeOwnershipInstance land: ", response);

            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }

    }
}

module.exports = {LandService}