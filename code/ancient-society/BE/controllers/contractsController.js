//ABI
const buildingAbi = require('../ABI/building-abi.json');
const fishermanAbi = require('../ABI/fisherman-abi.json');
const wfishermanAbi = require('../ABI/wancientfisherman-abi.json');
const bundleAbi = require('../ABI/bundle-abi.json');
const resourceAbi = require('../ABI/resources-abi.json');
const stakerAbi = require('../ABI/staker-abi.json');

//LIBRARIES
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');
const { ReasonPhrases, StatusCodes, getReasonPhrase } = require('http-status-codes');
const rTracer = require('cls-rtracer')

//SERVER CONFIG
const {serverConfig} = require('../config/serverConfig')

//MODELS
const ContractsModel = require('../models/contractsModel');
const UserModel = require('../models/userModel');
const VoucherModel = require('../models/voucherModel');
const BuildingsModel = require('../models/buildingsModel');

//SERVICES
const {VoucherService} = require('../services/voucherService');

//QUERIES
const {UserQueries} = require('../queries/userQueries');
const {VoucherQueries, VoucherFarmerQueries} = require('../queries/voucherQueries');
const {ServerQueries} = require('../queries/serverQueries');

//HELPERS
const {UserHelper} = require('../helpers/userHelper')

//VALIDATION
const { createVoucherValidation } = require('../validations/index').contractsValidation;

//LOGGER
const logger = require('../logging/logger');

//UTILS
const Sanitizer = require('../utils/sanitizer');
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');

//ERRORS
const { AppError, SEVERITY } = require('../errors/index');
const { ForbiddenError, BadGatewayError } = require('../errors/appError');

//INIT
let sanitizer = new Sanitizer();
let whitelist = new ContractsModel.WhitelistService();

//WEB3
const web3 = serverConfig.chain.httpWeb3;

//CONSTANTS
const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

const MAX_FISHERMAN_PRIVATE = 5;
const SIGNING_DOMAIN_NAME_LAND = "AncientStakerLand";

//CONTROLLERS

async function isWhitelisted(req, res){
	logger.info(`isWhitelisted START `);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
    let address = req.body.address;

	// let isPrivateOneMint;
	// let isPublicMint;
	// let fishermanAvailable;

	// try{
	// 	isPrivateOneMint = await myFisherman.methods.isPrivateOneMint().call();
	// 	isPublicMint = myFisherman.methods.isPublicMint().call();
	// }catch(error){
	// 	logger.error(`Error in isWhitelisted, isPrivateOneMint or isPublicMint failed: ${Utils.printErrorLog(error)}`);
	// }
	

	// let numberOfMintFm;


    if(address == undefined || address == null){
		logger.warn(`Bad request,invalid address: ${address}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {errorMessage: 'req is null'}
        })
    }

	// if(!sanitizer.sanitizeAddress(address) || !sanitizer.sanitizeType(nftType) || !sanitizer.sanitizeNftId(nftId)){
    //     logger.warn(`Bad request,invalid address: ${address}, or type: ${nftType}, or nftId: ${nftId}`);
    //     return res
	// 	.status(401)
	// 	.json({
    //         success: false,
    //         error: {errorMessage: 'not a valid address'}
    //     })
    // }

	if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}, or type: ${nftType}, or nftId: ${nftId}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }

	// if(!web3.utils.isAddress(address)){
	// 	return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {errorMessage: 'not an address'}
    //     });
	// }

	logger.info(`isWhitelisted address: ${address}`);
    // logger.info(`isWhitelisted request, address: ${address}`);
	

    //vanno cambiate le configs della chain a cui si collega web3
    // const contract = new web3.eth.Contract(abiTownhall, "CONTRACT_ADDRESS");


	// try{
	// 	isPrivateOneMint = await myContractTh.methods.isPrivateOneMint().call();
	// 	isPrivateTwoMint = await myContractTh.methods.isPrivateTwoMint().call();
	// 	isPublicMint = await myContractTh.methods.isPublicMint().call();
	// }catch(err){
	// 	console.log("ERRORE CHIAMANDO CONTRACT TH PER isPrivateMint: ", err);
	// }

	// if( !(isPrivateOneMint) ){
	// 	return res
    // 	.json({
	// 		success: false,
	// 		error:{
	// 			errorCode: 0,  //0 min closed 1  no whitelist 2 whitelist but no mint available
	// 			errorMessage: "Mints are closed"
	// 		}
	// 	});
	// }

	if(!whitelist.isVerified(address)){
		return res
    	.json({
			success: false,
			error:{
				errorCode: 1,  //0 min closed 1  no whitelist 2 whitelist but no mint available
				errorMessage: "Address not whitelisted"
			}
		});
	}

	//bigNumberHandling

    // if(numberOfMintTh > 0 || numberOfMintLj > 0 || numberOfMintSm > 0){
    //     return res
	// 	.json({
	// 		success: false,
	// 		data:{  //if error.errorCode == 2
	// 			townhall: numberOfMintTh === 0 ? true : false,
	// 			lumberjack: numberOfMintLj === 0 ? true : false,
	// 			stonemine: numberOfMintSm === 0 ? true : false
	// 		},
	// 		error:{
	// 			errorCode: 2,  //0 min closed 1  no whitelist 2 whitelist but no mint available
	// 			errorMessage: "Address has already minted"
	// 		}
	// 	});
    // }
	logger.info(`isWhitelisted response:${
		JSON.stringify({
			merkleProof: whitelist.generateMerkleProof(address),
			info: "User whitelisted"
		})
	}`);
	logger.info(`isWhitelisted END`);
	return res
	.status(200)
	.json({
		success: true,
		data:{
			merkleProof: whitelist.generateMerkleProof(address),
			info: "User whitelisted"
		}
	});

}

async function createVoucher(req, res, next){
	logger.info(`createVoucher START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.info(`id: ${rTracer.id()}`)
	let VOUCHER_ENABLED
	try{
		VOUCHER_ENABLED = await ServerQueries.getVoucherEnabled();
	}catch(error){
		logger.error(`Error in ServerQueries.getVoucherEnabled(), ${Utils.printErrorLog(error)}`)

		return next(new AppError.BadGatewayError(
			`Error in ServerQueries.getVoucherEnabled(), ${Utils.printErrorLog(error)}`
		))
	}
	logger.debug(`VOUCHER_ENABLED value: ${VOUCHER_ENABLED[0].value}`);

	if(VOUCHER_ENABLED && VOUCHER_ENABLED[0]?.value == 'false'){
		logger.error(`VOUCHER is not enabled`);

		return next(new AppError.ForbiddenError(
			`Vouchers are closed`
		));
	}

	let address = req.locals.address;
	let quantity = req.body.quantity;

	let resources;
	let resource;
	let response;

	let blockNumber;

	const {error: validationError, value } = createVoucherValidation({address, quantity});

	if(validationError){

		logger.warn(`Input null or undefined, validationError: ${Utils.printErrorLog(validationError)}`);

		return next(new AppError.BadRequestError(
			`Input null or undefined, validationError: ${JSON.stringify(validationError)}`
		));
	}

	logger.info(`createVoucher address: ${address}`);
    logger.info(`createVoucher request, address: ${address}, quantity: ${quantity}`);
	
	quantity = parseInt(quantity);  //can mint only integer tokens
	
	try {
		response = await VoucherQueries.getCreatedOrPendingVouchersByAddress(address);
	} catch (error) {
		logger.error(`Error in VoucherQueries.getCreatedOrPendingVouchersByAddress:${Utils.printErrorLog(error)}`);
        
		return next(new AppError.InternalError(
			`Error in VoucherQueries.getCreatedOrPendingVouchersByAddress:${Utils.printErrorLog(error)}`
		))
	}

	logger.debug(`response getCreatedOrPendingVouchersByAddress: ${JSON.stringify(response)}`);

	if(response?.length > 0){
		return next(new AppError.MethodNotAllowedError(
			`voucher already created and not minted first, response: ${JSON.stringify(response)}`
		))
	}

	try {
		resources = await UserQueries.getResources(address);
	} catch (error) {
		logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return next(new AppError.BadGatewayError(
			`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`
		))

		
	}
	logger.debug(`response getResources :${JSON.stringify(resources)}`);

	resource = UserHelper.getResourceGivenType(resources, 1);

	if( (resource < quantity) ){

		logger.error(`Not enough balance, resource :${JSON.stringify(resource)}, quantity:${quantity}`);

		return next(new AppError.UnauthorizedError(
			`Not enough balance, resource :${JSON.stringify(resource)}, quantity:${quantity}`
		));
	}

	
	if(serverConfig.routes.fee.withdrawFee){
		let withdrawFee = quantity * serverConfig.routes.fee.withdrawFeeValue;
		logger.debug(`withdrawFee: ${withdrawFee}`);
		
		if(resource < (quantity + withdrawFee)){
			logger.error(`Not enough balance to pay the fee, resource :${JSON.stringify(resource)}, quantity:${quantity}`);

			return res
			.json({
				success: false,
				error: {
					errorMessage: "You don't have enough balance to pay the fee"
				}
			});
		}

		let feeResponse;
		try{
			feeResponse = await UserQueries.subAncienPro(address, withdrawFee);
			
		}catch(error){
			logger.error(`Not enough balance to pay the fee, resource :${JSON.stringify(resource)}, quantity:${quantity}`);

	
			return next(new AppError.UnauthorizedError(
				`Not enough balance to pay the fee, resource :${JSON.stringify(resource)}, quantity:${quantity}`
			));
		}

		if(feeResponse[0].changedRows == 0){
			logger.error(`fee not decreased, response:${JSON.stringify(feeResponse)} resource :${JSON.stringify(resource)}, quantity:${quantity}`);

			return next(new AppError.InternalError(
				`fee not decreased, response:${JSON.stringify(feeResponse)} resource :${JSON.stringify(resource)}, quantity:${quantity}`	
			));

		}

		resource = feeResponse[1];
	}

	let subResponse
	try{
		subResponse = await UserQueries.subAncienPro(address, quantity);
		
	}catch(error){
		logger.error(`Not enough balance to withdraw, resource :${JSON.stringify(resource)}, quantity:${quantity}`);

		return next(new AppError.UnauthorizedError(
			`Not enough balance to withdraw, resource :${JSON.stringify(resource)}, quantity:${quantity}`
		));
	}

	if(subResponse[0].changedRows == 0){
		logger.error(`fee not decreased, response:${JSON.stringify(subResponse)} resource :${JSON.stringify(resource)}, quantity:${quantity}`);

		return next(new AppError.InternalError(
			`fee not decreased, response:${JSON.stringify(subResponse)} resource :${JSON.stringify(resource)}, quantity:${quantity}`
		))

	}

	resource = subResponse[1];


	//LIMIT MAX QUANTITY FOR A VOUCHER, BLOCK THE SERVER
	// if(quantity >= serverConfig.MAX_VOUCHER_VALUE){
	// 	serverConfig.VOUCHER_ENABLED = false;

	// 	try{

	// 	}catch(error){

	// 	}

	// 	logger.error(`BUGGER amount over limit:${address}`);
	// 	//Here install a panicError or emergencyError 
	// 	return next(new AppError.ForbiddenError(
	// 		`BUGGER amount over limit:${address}, quantity:${quantity}`
	// 	));
	// }

	try {
		response = await VoucherQueries.getCreatedOrPendingVouchersByAddress(address);
	} catch (error) {
		logger.error(`Error in VoucherQueries.getCreatedOrPendingVouchersByAddress:${Utils.printErrorLog(error)}`);
        
		return next(new AppError.InternalError(
			`Error in VoucherQueries.getCreatedOrPendingVouchersByAddress:${Utils.printErrorLog(error)}`
		))
	}

	logger.debug(`response getCreatedOrPendingVouchersByAddress: ${JSON.stringify(response)}`);

	if(response?.length > 0){
		return next(new AppError.MethodNotAllowedError(
			`voucher already created and not minted second, response: ${JSON.stringify(response)}`
		))
	}


	try {
		blockNumber = await web3.eth.getBlockNumber(); 
	} catch (error) {
		logger.error(`Error in w3b.eth.getBlockNumber:${Utils.printErrorLog(error)}`);
        return next(new AppError.BadGatewayError(
			`Error in w3b.eth.getBlockNumber:${Utils.printErrorLog(error)}`
		));
	}
	logger.debug(`response getBlockNumber: ${JSON.stringify(blockNumber)}`);

	try {
		response = await VoucherQueries.generatePendingVoucher(address, quantity, blockNumber);
	} catch (error) {
		logger.error(`Error in VoucherQueries.createVoucher:${Utils.printErrorLog(error)}`);
        return next(new AppError.BadGatewayError(
			`Error in VoucherQueries.createVoucher:${Utils.printErrorLog(error)}`
		));
	}

	logger.debug(`response generatePendingVoucher:${JSON.stringify(response)}`);

	logger.info("createVoucher END");

	return res
	.status(201)
	.json({
		success: true,
		data:{
			newAmount: Utils.isFirstPropertyNotNullInArray(resource, 'ancien') ? resource[0].ancien : 0
		}
	});

}

async function getVouchers(req, res){
	logger.info(`getVouchers START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
	let address = req.locals.address;

	let vouchers;
	let voucher;
	let responseVoucher;
	let voucherService = new VoucherModel.VoucherService();

	if(address == undefined || address == undefined){
		logger.warn(`Bad request, input void or undefined, address: ${address}`);
		return res
		.status(400)
		.json({
			success: false,
			error: {
				errorMessage: "Bad request: address is not defined or null"
			}
		});
	}

	if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
	logger.info(`getVouchers address: ${address}`);

	try {
		vouchers = await VoucherQueries.getCreatedOrPendingVouchersByAddress(address);
	} catch (error) {
		logger.error(`Error in vocuherService.getVouchersGivenAddress:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getVouchersGivenAddress: ${JSON.stringify(vouchers)}`);
	if( vouchers.length > 0 ){
		voucher = vouchers[0]
		if(voucher.status == 'pending'){
			responseVoucher = {
				id: voucher.id,
				quantity: voucher.quantity,
				status: voucher.status,
			}
		}else{
			responseVoucher = {
				id: voucher.id,
				quantity: voucher.quantity,
				status: voucher.status,
				blockNumber: voucher.blockNumber,
				signature: voucher.signature
			}
		}
	}

	logger.info(`response getVouchers : ${JSON.stringify(responseVoucher)}`);
	logger.info(`getVouchers END`);
	return res
	.status(200)
	.json({
		success: true,
		data: {
			voucher: responseVoucher
		}
	});
}


async function getFarmerVouchers(req, res){
	logger.info(`getFarmerVouchers START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
	let address = req.locals.address;

	let vouchers;
	let voucher;
	let responseVoucher;
	let voucherService = new VoucherModel.VoucherService();

	if(address == undefined || address == undefined){
		logger.warn(`Bad request, input void or undefined, address: ${address}`);
		return res
		.status(400)
		.json({
			success: false,
			error: {
				errorMessage: "Bad request: address is not defined or null"
			}
		});
	}

	if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
	logger.info(`getVouchers address: ${address}`);

	try {
		vouchers = await VoucherFarmerQueries.getCreatedOrPendingVouchersByAddress(address);
	} catch (error) {
		logger.error(`Error in vocuherService.getVouchersGivenAddress:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getVouchersGivenAddress: ${JSON.stringify(vouchers)}`);
	if( vouchers.length > 0 ){
		voucher = vouchers[0]
		if(voucher.status == 'pending'){
			responseVoucher = {
				id: voucher.id,
				quantity: voucher.quantity,
				status: voucher.status,
			}
		}else{
			responseVoucher = {
				id: voucher.id,
				quantity: voucher.quantity,
				status: voucher.status,
				blockNumber: voucher.blockNumber,
				signature: voucher.signature
			}
		}
	}

	logger.info(`response getFarmerVouchers : ${JSON.stringify(responseVoucher)}`);
	logger.info(`getFarmerVouchers END`);
	return res
	.status(200)
	.json({
		success: true,
		data: {
			voucher: responseVoucher
		}
	});
}

async function getAmountWithdrawable(req, res){
	logger.info(`getAmountWithdrawable START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
	let address = req.locals.address;

	if(address == undefined || address == undefined){
		logger.warn(`Bad request, input void or undefined, address: ${address}`);
		return res
		.status(400)
		.json({
			success: false,
			error: {
				errorMessage: "Bad request: address is not defined or null"
			}
		});
	}

	if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }

	let isNewAccount

	try {
		isNewAccount = await UserQueries.isNewAccount(address);
	} catch (error) {
		logger.error(`Error in UserQueries.isNewAccount:${Utils.printErrorLog(error)}`);
		return next(new BadGatewayError(`Error in UserQueries.isNewAccount, error: ${Utils.printErrorLog(error)}`));
	}

	logger.debug(`response isNewAccount: ${JSON.stringify(isNewAccount)}`);

	if(!isNewAccount || isNewAccount[0].isNewAccount){
		logger.debug(`A new account cannot withdraw, isNewAccount: ${JSON.stringify(isNewAccount)}, address: ${address}`);
		
		return res
		.status(200)
		.json({
			success: true,
			data: {
				isAllowed: false
			}
		})	
	}

	let total;
	try {
		total = await VoucherQueries.getLastDayVouchersSum(address);
	} catch (error) {
		logger.error(`Error in VoucherQueries.getLastDayVouchersSum, error: ${Utils.printErrorLog(error)}`)
		return next(new BadGatewayError(`Error in VoucherQueries.getLastDayVouchersSum, error: ${Utils.printErrorLog(error)}`));
	}

	logger.debug(`response getLastDayVouchersSum: ${JSON.stringify(total)}`);

	let totalWithdrawable = Number(serverConfig.MAX_VOUCHER_VALUE) - (total?.length > 0 && total[0].somma ? total[0].somma : 0);
	totalWithdrawable = totalWithdrawable > 0 ? totalWithdrawable : 0;

	logger.info(`response getAmountWithdrawable : ${JSON.stringify(totalWithdrawable)}`);
	logger.info(`getAmountWithdrawable END`);
	return res
	.status(200)
	.json({
		success: true,
		data: {
			isAllowed: true,
			amount: totalWithdrawable
		}
	});
}

//MUST CHANGE PRIVATE_KEY_SIGNER AND STAKER_LAND_ADDRESS AND CHAIN_ID
async function createLandVoucher(req, res){
	let address = req.body.address;
	let idContract = req.body.idContract;
	let creation = req.body.creation;
	let expireTime = req.body.expireTime;
	let fee = req.body.fee;

	let responseVoucher;

	// ADD VALIDATION AND LOGIC TO ENSURE LANDWONER IS ALLOWED TO DESTROY/CREATE A CONTRACT
	
	try{
		responseVoucher = await VoucherService.createLandVoucher(address, idContract, creation, expireTime, fee);
	}catch(error){
		logger.error(`Error in VoucherService.createLandVoucher: ${Utils.printErrorLog(error)}`)
		return res.json({
			success: false
		})
	}

	return res.json({
		success: true,
		data:{
			voucher: responseVoucher
		}
	})

	
}

async function createFarmerVoucher(req, res){
	let address = req.body.address;
	let responseVoucher;

	// ADD VALIDATION AND LOGIC TO ENSURE LANDWONER IS ALLOWED TO DESTROY/CREATE A CONTRACT
	
	try{
		responseVoucher = await VoucherService.createFarmerVoucher(address);
	}catch(error){
		logger.error(`Error in VoucherService.createFarmerVoucher: ${Utils.printErrorLog(error)}`)
		return res.json({
			success: false
		})
	}

	return res.json({
		success: true,
		data:{
			voucher: responseVoucher
		}
	})

	
}

async function testIsOpen(req, res){
	let result;
	
	return res.json({
		result
	});
}





module.exports = {
	isWhitelisted, 
	testIsOpen, 
	createFarmerVoucher, 
	getFarmerVouchers,
	createVoucher, 
	getVouchers, 
	createLandVoucher, 
	getAmountWithdrawable}


//nella create vouchere sanitize quantity e is positiv integer attraverso la classe
