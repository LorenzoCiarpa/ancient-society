const mysql = require('../../config/databaseConfig');
const Web3 = require('web3');

const {serverConfig} = require('../../config/web3Config')

const web3 = serverConfig.chain.httpWeb3;

class VoucherService{
    constructor(){}

    async voucherMintedOnData(event){
        console.log("event voucherMinted: ", event);
        let res; 
        let voucherService = new VoucherQuery();

        let mintTime = new Date().toISOString().slice(0, -1);
        try{
            res = await voucherService.mintVoucher(event.returnValues, 'minted', mintTime);
            console.log("respnse in mint..: ", res);
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in mint..: ", err);
            // log.error("error in save ... :", err);
        }
    
    
        // Do something here
    }
    
    async voucherDestroyedOnData(event){
        console.log("event voucherDestroyed: ", event);
        let res; 
        let voucherService = new VoucherQuery();
        let inventoryService = new InventoryService();

        let idx = event.returnValues.idxDestroy;
        let signature = event.returnValues.signature;

        let voucher;
        let owner;
        let quantity;

        let resources;
        let resource;
        let response;

        let type;

        let contractAddressEvent = event.address;

        if(contractAddressEvent == serverConfig.chain.contracts.ANCIEN_ADDRESS){
            type = 1;
        }else if(contractAddressEvent == serverConfig.chain.contracts.WOOD_ADDRESS){
            type = 2;
        }else if(contractAddressEvent == serverConfig.chain.contracts.STONE_ADDRESS){
            type = 3;
        }

        console.log("signature: ", signature);
        console.log("type: ", type);
        console.log("contractAddressEvent: ", contractAddressEvent);

            

        try{
            voucher = await voucherService.getVoucher(signature);
            if(voucher.length == 0){
                console.log("voucher not found");
                return "voucher not found"
            }
            console.log("voucher: ", voucher);

            voucher = voucher[0];
            owner = voucher.address;
            quantity = voucher.quantity;

            quantity = parseInt(quantity);

            console.log("voucher[0]: ", voucher);


            resources = await inventoryService.getResources(owner);
            console.log("resources address: ", resources);

            resource = inventoryService.getResourceGivenType(resources, type);
            console.log("resource address: ", resource);

            resource += quantity;

            response = await inventoryService.setResourcesGivenType(owner, type, resource);
            console.log("Response update inventory: ", response);


            let destroyTime = new Date().toISOString().slice(0, -1);


            res = await voucherService.destroyVoucher(event.returnValues, 'destroyed', destroyTime);
            console.log("respnse in destroy..: ", res);
            
            // log.info("response in ..:", res);
        }catch(err){
            console.log("error in destroy..: ", err);
            // log.error("error in save ... :", err);
        }
    }
    
    async voucherMintedOnChange(change){
        console.log("change ", change);
    }
    
    async voucherDestroyedOnChange(change){
        console.log("change ", change);
    }
    
    async voucherMintedOnError(error){
        console.log("error in voucherMintedOnError", error);
    
    }
    
    async voucherDestroyedOnError(error){
        console.log("error in voucherMintedOnError", error);
        
    }
}

class VoucherQuery {
    constructor() {}

    
    async mintVoucher(resValues, status, mintTime){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ?, mintTime = ? WHERE id = ?";

            mysql.query(sql, [status, mintTime, resValues.id], (err, rows) => {
                if(err) return reject(err);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async destroyVoucher(resValues, status, destroyTime){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ?, destroyTime = ? WHERE signature = ?";

            mysql.query(sql, [status, destroyTime, resValues.signature], (err, rows) => {
                if(err) return reject(err);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async deleteVoucher(resValues, status){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ? WHERE signature = ?";

            mysql.query(sql, [status, resValues.signature], (err, rows) => {
                if(err) return reject(err);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async getVoucher(signature){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM vouchers WHERE signature = ?";

            mysql.query(sql, signature, (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null){
                    return reject(err);
                }
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }
}

class InventoryService {
    constructor(){}

    async getResources(address){
        return new Promise((resolve, reject) => {
            let sql = "SELECT ancien, wood, stone FROM utente WHERE address = ?";

            mysql.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    async setResources(address, resources){
        
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ?, wood = ?, stone = ? WHERE address = ?";

            mysql.query(sql, [resources.resources.ancien, resources.resources.wood, resources.resources.stone, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(rows);
                }
            });
        });
    }

    //Va messa le await qui??
    async setResourcesGivenType(address, type, resource){  
        console.log("type setRes:", resource);
        switch(type){
            case 1: {
                return await this.setAncien(address, resource);
            }

            case 2: {
                return await this.setWood(address, resource);
            }

            case 3: {
                console.log("arrivato");
                return await this.setStone(address, resource);
            }

            default: 
                return null;
        }
    }

    async setAncien(address, newAncien){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ? WHERE address = ?";

            mysql.query(sql, [newAncien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(rows);
                }
            });
        });
    }

    async setWood(address, newWood){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET wood = ? WHERE address = ?";

            mysql.query(sql, [newWood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(rows);
                }
            });
        });
    }

    async setStone(address, newStone){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET stone = ? WHERE address = ?";

            mysql.query(sql, [newStone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(rows);
                }
            });
        });
    }

    getResourceGivenType(resources, type){
        switch(type){
            case 1: {
                return resources.ancien;
            }

            case 2: {
                return resources.wood;
            }

            case 3: {
                return resources.stone;
            }

            default: {
                return null;
            }
        }
    }

}

class BurnService {
    constructor(){}

    async updateBurnRecord(idx, address, quantity, burnTime, type, blockNumber){
        
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO burn (idxBurn, address, quantity, burnTime, type, blockNumber) values (?, ?, ?, ?, ?, ?)";

            mysql.query(sql, [idx, address, quantity, burnTime, type, blockNumber], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getBurnRecordGivenTypeAndIdBurn(idxBurn, type){
        
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM burn WHERE idxBurn = ? AND type = ?";

            mysql.query(sql, [idxBurn, type], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "burnReocrdGivenTypeAndIdBurn undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getLastBurnRecordByAddressAndType(address, type){
        
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT quantity, burnTime
                FROM burn
                WHERE address = ?
                AND type = ?
                ORDER BY id DESC
            `;

            mysql.query(sql, [address, type], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "getLastBurnRecordByAddressAndTypes undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async createDailyReward(address){
        
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO daily_reward
                    (address, rewardTime, notified)
                VALUES
                    (?, current_timestamp, 0)
            `;

            mysql.query(sql, [address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "createDailyReward undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getDailyRewardDrop(){
        
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * 
                FROM daily_reward_drop
            `;

            mysql.query(sql, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "getDailyRewardDrop undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async dropDailyReward(address, idItem, quantity){
        console.log(address, idItem, quantity)
        return new Promise((resolve, reject) => {
            let sql = `
                    INSERT INTO item_instance
                    (address, idItem, quantity)
                VALUES
                    (?, ?, ?)
                ON DUPLICATE KEY
                UPDATE 
                    quantity = quantity + ?
            `;


            mysql.query(sql, [address, idItem, quantity, quantity], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "dropDailyReward undefined or null"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getStakedNFT(address){
        return new Promise((resolve, reject) => {
            console.log(`getStakedNFT start`);
            let sql = `
            SELECT *
            FROM buildings
            WHERE address = ? AND stake = 1`;

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in getStakedBuildings: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    console.log(`getStakedNFT end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getOwnerStruct(idBuilding, type){
        let result;
        let addr;
        let struct={};
        if(type==1) addr = serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS;
        if(type==2) addr = serverConfig.chain.contracts.STAKER_LUMBERJACK_ADDRESS;
        if(type==3) addr = serverConfig.chain.contracts.STAKER_STONEMINE_ADDRESS;
        if(type==4) addr = serverConfig.chain.contracts.STAKER_FISHERMAN_ADDRESS;
        if(type==5) return {
            owner: '',
            blockTime: 86400000,
            isStake: true
        };

    
        let hash = web3.utils.soliditySha3({
            type: "uint256",
            value: idBuilding  //tokenId -> deve diventare i = idBuilding
        },
        {
            type: "uint",
            value: 7  //slot -> fisso, sarebbe offset posizione di memoria nello storage del contract
        })
    
        try{
            result = await web3.eth.getStorageAt(addr, hash)
        }catch(error){
            console.log("web3.eth.getStorageAt: ", error, address, idBuilding)
        }
        console.log("result:",result);
    
        let noX = result.substring(12);
        let owner = noX.substring(0,40);
        let blockTime = noX.substring(40, 52);
        let isStake = noX.substring(52, 54);
    
        owner = '0x' + owner;
        blockTime = '0x' + blockTime;
        isStake = '0x' + isStake;

        blockTime = web3.utils.hexToNumber(blockTime)
        isStake = web3.utils.hexToNumber(isStake)
    

        // console.log("owner : ", owner);
        // console.log("blockTime : ", blockTime);
        // console.log("isStake : ", isStake);

        struct = {
            owner,
            blockTime,
            isStake
        };
        
        // if(isStake) console.log("isStakeBool : ", true);
        // else console.log("isStakeBool : ", false);
        return struct;
    }
    
}
module.exports = {VoucherService, InventoryService, BurnService};