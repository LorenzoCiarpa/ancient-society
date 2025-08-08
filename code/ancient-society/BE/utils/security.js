//LIBRARIES
const { ReasonPhrases, StatusCodes, getReasonPhrase } = require('http-status-codes');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

//LOGGER
const logger = require("../logging/logger");

//QUERIES
const {SecurityQueries} = require("../queries/index").securityQueries;

//ERRORS
const AppError  = require('../errors/appError');

//UTILS
const Validator = require("./validator");
const {Utils} = require("./utils");

//CONFIG
const {serverConfig} = require('../config/serverConfig')

//SERVER
const SERVER = require('../www/bin/static')

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: serverConfig.EMAIL.ADMIN_MAIL || 'ciarpaglini.lorenzo@gmail.com',
//       pass: serverConfig.EMAIL.ADMIN_MAIL_PASSWORD || ''
//     }
// });
  
const mailOptions = {
    from: serverConfig.EMAIL.ADMIN_MAIL || 'ciarpaglini.lorenzo@gmail.com',
    to: `${serverConfig.EMAIL.BUITRE_MAIL || 'lorenzo.ciarpaglini@gmail.com'}`,
    // to: `${serverConfig.EMAIL.BUITRE_MAIL || 'lorenzo.ciarpaglini@gmail.com'}, ${serverConfig.EMAIL.LCHLL_MAIL || ''}, ${serverConfig.EMAIL.MONE_MAIL || ''}`,
    subject: 'Stanno a fa impicci test, Critical Error Occured in App',
  //   text: 'That was easy!'
};

// const bot = new TelegramBot(serverConfig.telegramChat.TELEGRAM_BOT_TOKEN, {polling: true});

class Security{
    constructor(){}

    static async banJwt(req, reason = ''){
        let address = req.locals.address;
        let jwtToken = req.locals.jwt;

        try {
            await SecurityQueries.banJwt(address, jwtToken, reason)
        } catch (error) {
            logger.error(`Error in SecurityQueries.banJwt, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.banJwt, error: ${Utils.printErrorLog(error)}`
            ));
        }
    }

    static async banAddress(req, reason = ''){
        let address = req.locals.address;

        try {
            await SecurityQueries.banAddress(address, reason)
        } catch (error) {
            logger.error(`Error in SecurityQueries.banAddress, error: ${Utils.printErrorLog(error)}`)
            throw (new AppError.BadGatewayError(
                `Error in SecurityQueries.banAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }
    }

    static async banIpAddress(req, reason = ''){
        let address = req.locals.address;
        let ipAddressJwt = req.locals.ipAddress;
        let ipAddressReq = Validator.getIpAddress(req);

        try {
            await SecurityQueries.banIpAddress(address, ipAddressJwt, reason)
        } catch (error) {
            logger.error(`Error in SecurityQueries.banIpAddress, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.banIpAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }

        try {
            await SecurityQueries.banIpAddress(address, ipAddressReq, reason)
        } catch (error) {
            logger.error(`Error in SecurityQueries.banIpAddress, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.banIpAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }
    }

    static async checkIsBannedAddress(req){
        let address = req.locals.address;
        
        //ADDRESS BANNED CHECK
        let isAddressBanned;
        try {
            isAddressBanned = await SecurityQueries.isBanAddress(address);
        } catch (error) {
            logger.error(`Error in SecurityQueries.isBanAddress, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.isBanAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }

        if(isAddressBanned.length > 0){
            throw(new AppError.AppError(
                {
                    logMessage: `Address banned trying to login, address: ${address}`,
                    internalCode: 0
                },
                403,
                getReasonPhrase(403),
                false,
                {
                    errorMessage: `Your account has been banned`
                }
            ))
        }

    }

    static async checkIsBannedIpAddress(req){
        let address = req.locals.address;
        let ipAddressJwt = req.locals.ipAddress;
        let ipAddressReq = Validator.getIpAddress(req);

        
        //FIRST IPADDRESS BANNED CHECK

        let isIpAddressBanned;
        try {
            isIpAddressBanned = await SecurityQueries.isBanIpAddress(ipAddressJwt);
        } catch (error) {
            logger.error(`Error in SecurityQueries.isBanIpAddress, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.isBanIpAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }

        if(isIpAddressBanned.length > 0){
            throw(new AppError.AppError(
                {
                    logMessage: `ipAddress banned trying to login, address: ${address}, ipAddressJwt: ${ipAddressJwt}, ipAddressReq: ${ipAddressReq}`,
                    internalCode: 0
                },
                403,
                getReasonPhrase(403),
                false,
                {
                    errorMessage: `Your account has been banned`
                }
            ))
        }

        //SECOND IPADDRESS BANNED CHECK

        try {
            isIpAddressBanned = await SecurityQueries.isBanIpAddress(ipAddressReq);
        } catch (error) {
            logger.error(`Error in SecurityQueries.isBanIpAddress, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.isBanIpAddress, error: ${Utils.printErrorLog(error)}`
            ));
        }

        if(isIpAddressBanned.length > 0){
            throw(new AppError.AppError(
                {
                    logMessage: `ipAddress banned trying to login, address: ${address}`,
                    internalCode: 0
                },
                403,
                getReasonPhrase(403),
                false,
                {
                    errorMessage: `Your account has been banned`
                }
            ))
        }
    }

    static async checkIsBannedJwt(req){
        let address = req.locals.address;
        let jwtToken = req.locals.jwt;

        //JWT BANNED CHECK

        let isJwtBanned;
        try {
            isJwtBanned = await SecurityQueries.isBanJwt(jwtToken);
        } catch (error) {
            logger.error(`Error in SecurityQueries.isBanJwt, error: ${Utils.printErrorLog(error)}`)
            throw(new AppError.BadGatewayError(
                `Error in SecurityQueries.isBanJwt, error: ${Utils.printErrorLog(error)}`
            ));
        }

        if(isJwtBanned.length > 0){
            throw(new AppError.AppError(
                {
                    logMessage: `jwt banned trying to login, address: ${address}, jwt: ${jwtToken}`,
                    internalCode: 0
                },
                403,
                getReasonPhrase(403),
                false,
                {
                    errorMessage: `Your account has been banned`
                }
            ))
        }
    }

    static gracefulShutdown(signal) {
        if (signal) console.log(`\nReceived signal ${signal}`)
        console.log('Gracefully closing http server')

        // closeAllConnections() is only available from Node v18.02
        // if (server.closeAllConnections) server.closeAllConnections()
        // else setTimeout(() => process.exit(0), 5000)
    
        try {
            SERVER.server.close(function (err) {
                if (err) {
                    logger.error(`There was an error: ${Utils.printErrorLog(err)}`)
                    process.exit(1)
                } else {
                    console.log('http server closed successfully. Exiting!')
                    process.exit(0)
                }
            })
        } catch (err) {
            logger.error(`There was an error: ${Utils.printErrorLog(err)}`)
            setTimeout(() => process.exit(1), 500)
        }
    }
    
    static async sendMailToAdmin(msg){
        //ADD UUID
        mailOptions.text = msg;
        return await transporter.sendMail(mailOptions);

    }

    static async sendTelegramMessage(msg, isEmergency){
        if(isEmergency){
            // try{
            //     bot.sendMessage(serverConfig.telegramChat.CHAT_ID_B3, msg);
            //     bot.sendMessage(serverConfig.telegramChat.CHAT_ID_M1, msg);
            //     bot.sendMessage(serverConfig.telegramChat.CHAT_ID_LUCA, msg);
            // }catch(error){
            //     logger.error(`Error in sending telegram message, error: ${Utils.printErrorLog(error)}`);
            // }
            console.log("Emergency")
        }
        //ADD UUID
        try{
            bot.sendMessage(serverConfig.telegramChat.CHAT_ID_B3, msg);
            // bot.sendMessage(serverConfig.telegramChat.CHAT_ID_GROUP, msg);
        }catch(error){
            logger.error(`Error in sending telegram message, error: ${Utils.printErrorLog(error)}`);
        }
        return;
    }


}

module.exports = {
    Security
}
