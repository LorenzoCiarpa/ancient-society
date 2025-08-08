
const Web3 = require('web3');
const { ethers } = require('ethers');

const {Utils} = require("../utils/utils");

const options = {

    // timeout: 30000,

    clientConfig: {
        // Useful if requests are large

        //maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        //maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

//ONLY READ

//HTTP
const web3http = new Web3(new Web3.providers.HttpProvider(""));

//WSS
// const web3wss = new Web3(new Web3.providers.WebsocketProvider("", options))

const SIGNING_DOMAIN_VERSION = "1";
const SIGNING_DOMAIN_NAME_LAND = "AncientStakerLand";
const SIGNING_DOMAIN_NAME_ANCIEN = "Ancien";

const SIGNER_PRIVATE_KEY = "";
const CHAIN_ID = 80001;
const BLOCKNUMBER = 54002929;
const CONTRACT_ADDRESS = "0xe7a63D8274b7De62a3EeaC75267B083Bc29878f3";

const {createPool} = require('mysql');

let mysql = createPool({
    host: '',
    user: 'alpha_user',
    password: '',
    database: 'alpha_db',
    port: '25060',
    connectionLimit: 1,
    timezone: "+00:00",
    multipleStatements: true
});

class SignerHelperAncien{
    constructor(contractAddress, chainId, signer){
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.signer = signer;
    }

    async createSignature(id, spender, tokens, blockNumber, signing_domain_name){
        
        const obj =  {
            id,
            spender,
            tokens,
            blockNumber
        };

        let domain = await this.signingDomain(signing_domain_name);
        const types = {
            AncienStruct: [
                {name: "id", type: "uint256"},
                {name: "spender", type: "address"},
                {name: "tokens", type: "uint256"},
                {name: "blockNumber", type: "uint256"}
            ]
        };

        const signature = await this.signer._signTypedData(domain, types, obj);
        return {
            obj,
            signature
        }
    }

    async signingDomain(signing_domain_name){
        if(this.domain != null){
            return this.domain;
        }
        this.domain = {
            name: signing_domain_name,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: this.contractAddress,
            chainId: this.chainId
        };
        return this.domain;
    }

    static async getSign(contractAddress, chainId, recordId, spender, tokens, blockNumber, signing_domain_name){

        let signer = new ethers.Wallet(SIGNER_PRIVATE_KEY);
        let lm = new SignerHelperAncien(contractAddress, chainId, signer);
        try {
            var voucher = await lm.createSignature(recordId, spender, tokens, blockNumber, signing_domain_name);
        } catch (error) {
            return error;
        }

        return voucher;
    }

    static getContractInfoGivenType(type){
        switch(type){
            case 1: {
                return {
                    contractAddress: contractAncien,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_ANCIEN
                };
            }
            
            case 2: {
                return {
                    contractAddress: contractWood,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_WOOD
                };
            }

            case 3: {
                return {
                    contractAddress: contractStone,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_STONE
                };
            }

            case 137: {
                return {
                    contractAddress: contractMaticReward,
                    signing_domain_name:  SIGNING_DOMAIN_NAME_MATIC_REWARD
                };
            }

            default:
                return null;
        }
    }

}




async function validateVoucherService(idVoucher){
    let voucher;
    try {
        voucher = await getVoucherInfo(idVoucher)
    } catch (error) {
        console.log(`Error in getVoucherInfo: `, error)
    }

    console.log("voucher: ", voucher)
    if(!voucher?.length > 0){
        console.log("NO voucher")
        return;
    }

    voucher = voucher[0];

    contractInfo = {
        contractAddress: CONTRACT_ADDRESS,
        signing_domain_name: SIGNING_DOMAIN_NAME_ANCIEN
    }

    let signature = await SignerHelperAncien.getSign(
        contractInfo.contractAddress,
        80001,
        voucher.id,
        voucher.address,
        voucher.quantity,
        voucher.blockNumber,
        contractInfo.signing_domain_name
    )

    console.log("signature: ", signature)

    try {
        await setVoucherInfo(signature.signature, idVoucher)
    } catch (error) {
        console.log(`Error in getVoucherInfo: `, error)
    }
}

async function getVoucherInfo(idVoucher){
	return new Promise((resolve, reject) => {
		let sql = `
        SELECT * 
        FROM vouchers
        WHERE id = ?
    	`

		mysql.query(sql, [idVoucher], (err, rows) => {
			if(err) reject(err);
			if(rows == undefined){
				console.log(`query error: ${JSON.stringify(err)}`);
				return reject({
					message: "undefined"
				});
			}else{
				console.log(`getPendingVouchers end`);
				return resolve(JSON.parse(JSON.stringify(rows)));
			}
		});
	});
    
}

async function setVoucherInfo(signature, idVoucher){
	return new Promise((resolve, reject) => {
		let sql = `
        UPDATE vouchers 
        SET status = 'created',
        createTime = CURRENT_TIMESTAMP,
        signature = ?
        WHERE id = ?
    	`

		mysql.query(sql, [signature, idVoucher], (err, rows) => {
			if(err) reject(err);
			if(rows == undefined){
				console.log(`query error: ${JSON.stringify(err)}`);
				return reject({
					message: "undefined"
				});
			}else{
				console.log(`getPendingVouchers end`);
				return resolve(JSON.parse(JSON.stringify(rows)));
			}
		});
	});
}

validateVoucherService(204089)