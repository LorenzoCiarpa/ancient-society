const logger = require("../logging/logger");
const Validator = require('../utils/validator');
const random = require('random');
const { Utils } = require("../utils/utils");
const { DevValidation } = require('../validations/devValidation');
const { DevQueries } = require("../queries/devQueries");
const { DevService } = require("../services/devService");
const { MatchMakingService } = require("../services/pvp/matchMakingService");

async function getChallengeWinners(req, res) {
    logger.info(`getChallangeWinners START  ipAddress: ${Validator.getIpAddress(req)}`);

    let validation
    validation = DevValidation.getChallengeWinnersValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let number = req.body.number;
    let idItem = req.body.idItem;

    //get all the addresses that own that idItem
    let addresses;
    try {
        addresses = await DevQueries.getAllOwners(idItem);
    } catch (error) {
        logger.error(`Error in DevQueries getAllOwners: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`addresses and quantity : ${JSON.stringify(addresses)}`);

    if(number>addresses.lenght){
        logger.error(`There are less addresses than the winners number`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if(number == addresses.lenght){
        let final = []
        for(let elem in addresses){
            final.push(elem.address);  
        }
        let insertWinners;
        try {
            insertWinners = await DevQueries.insertWinners(final);
        } catch (error) {
            logger.error(`Error in DevQueries insertWinners: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if(insertWinners.affectedRows != number){
            logger.error(`!!!!!!!!!!!! ERROR IN INSERT !!!!!!!!!!!!!!`)
        }
        logger.debug(`insertWinners response : ${JSON.stringify(insertWinners)}`);
        
        logger.info(`the addresses are the exact number of winners`)
        return res
            .json({
                success: true,
                data: {
                    winners: final
                }
            })
    }

    //build the array that has address x quantity
    let finalArray = DevService.buildAddressesArray(addresses);

    logger.debug(`The array is ${JSON.stringify(finalArray)}`);

    let winners = DevService.getWinners(finalArray,number)

    logger.debug(`The winners are ${JSON.stringify(winners)}`);

    let insertWinners;
    try {
        insertWinners = await DevQueries.insertWinners(winners);
    } catch (error) {
        logger.error(`Error in DevQueries insertWinners: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if(insertWinners.affectedRows != number){
        logger.error(`!!!!!!!!!!!! ERROR IN INSERT !!!!!!!!!!!!!!`)
    }
    logger.debug(`insertWinners response : ${JSON.stringify(insertWinners)}`);


    logger.info('getChallangeWinners END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                winners: winners
            }
        })
}

async function matchmakingRoutine(req,res){
    logger.info("MATCHMAKING ROUTINE START");
    let match
    try {
       match = await MatchMakingService.matchRoutine(); 
    } catch (error) {
        logger.error(`Error in matchmakingRoutine: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    return res
        .status(200)
        .json({
            success: true,
            data: {
                matches:match
            }
        })

}





module.exports = {getChallengeWinners,matchmakingRoutine}