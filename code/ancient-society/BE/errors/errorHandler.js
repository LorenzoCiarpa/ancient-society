

//IMPORT FILES
const {utils, queryCaller, security} = require('../utils/index')
const {logger} = require('../logging/index')
const AppError = require('./appError')
const { internalStatusCodes, getInternalPhrase } = require('./internalErrorCodes')

const {Utils} = utils;
const {Security} = security;
const Validator =  require('../utils/validator')




/*
Operational vs Progammer Errors
1)Operationals can be produced by differenet sources, e.g. connection lost, service unavailable, ecc.
2)Programmers errors are memory leaks, access to an undefined variable property.

The first must just be logged, while the second must handled, claimed, and restart gracefully the server
or in some cases (a.k.a hacker attack or attempts) must be close the server and never restart anymore
(set bool in db to false)

*/
class errorHandler{
    async handleError(error, responseStream, req) {
        
        logger.error(`ERROR_HANDLER START: address: ${req?.locals?.address}, ip: ${Validator.getIpAddress(req)}, error: ${Utils.printErrorLog(error)} ERROR_HANDLER END`);
        // await this.fireMonitoringMetric(error);

        // await this.sendTelegramMessage(error);
        // await this.sendMailIfCritical(error);
        // await this.banAccountIfAbuser(error, req) // (use internalCode and/or severity to choose who ban)
        // await this.crashIfUntrustedErrorOrSendResponse(error, responseStream);
        

    };

    async crashIfUntrustedErrorOrSendResponse(errorObj, responseStream){
        if(!this.isTrustedError(errorObj)){
            //if severity is 0
                //Query a db to set var to 0(close server permanently)
            if(errorObj.severity == 0){
                try{

                    const serverOpen = 'server_open', value = false; 
                    const params = [value, serverOpen];
    
                    const sql = `
                    UPDATE 
                        server_constant 
                    SET
                        value = ? 
                    WHERE
                        keyword = ?`;
                    
                    let resultQuery = await queryCaller.selectFromDB(sql, params, 'closeDb');
                    
                }catch(error){
                    logger.error(`Error in closing variable: ${Utils.printErrorLog(error)}`);
                }

                //send email to admins
                // try {
                //     Security.sendMailToAdmin(`Closing server`)
                // } catch (error) {
                //     logger.error(`Error in closing variable: ${Utils.printObject(error)}`);
                // }

                //send email to admins
                try {
                    Security.gracefulShutdown();
                } catch (error) {
                    logger.error(`Error in closing variable: ${Utils.printObject(error)}`);
                }
            }
        }

        return responseStream
        .status(errorObj.httpCode)
        .json({
            success: false,
            error: errorObj.responseObject
        });
    }

    async fireMonitoringMetric(error){
        //Needed if we have monitoring applications
    }

    isTrustedError(errorObj){
        if (errorObj instanceof AppError.AppError) {
            return errorObj.isOperational;
        }
        return false;
    }

    
    //Add more var to check to decide if and what to send by email
    async sendTelegramMessage(errorObj){
        let isEmergency = false;
        
        if(errorObj instanceof AppError.AppError){
            if(errorObj.severity < 3){
                isEmergency = true;
            }
        }

        try{
            Security.sendTelegramMessage(errorObj.logMessage, isEmergency);
        }catch(error){
            logger.error(`Error in sending telegram message, error: ${Utils.printErrorLog(error)}`);
        }finally{
            return;
        }

    }
    
    //Add more var to check to decide if and what to send by email
    async sendMailIfCritical(errorObj){
        let sentMail = false;
        let index = 0;

        //Correct way
        if (errorObj instanceof AppError.AppError) {
            if(errorObj.severity < 3){
                
                while(index < 3 && !sentMail){
                    
                    try{
                        await Security.sendMailToAdmin(errorObj.description)
                        sentMail = true
                    }catch(error){
                        logger.error(`Email not sent, error occured: ${Utils.printObject(error)}`);
                    }finally{
                        index++;
                    }
                }
            }
        }
        return;
    }

    async banAccountIfAbuser(errorObj, req){
        let sentMail = false;
        let index = 0;

        //Correct way
        if (errorObj instanceof AppError.AppError) {
            if(errorObj.internalCode == internalStatusCodes.BAN){ //BAN_CODE
                await Security.banJwt(req, 'Too many attempents at createVoucher');
                await Security.banAddress(req, 'Too many attempents at createVoucher');
                await Security.banIpAddress(req, 'Too many attempents at createVoucher');
            }
        }
        return;
    }

}

module.exports = new errorHandler();