const jwt = require('jsonwebtoken');
const authHelper = require('../helpers/authHelper');
const logger = require('../logging/logger');
const Validator = require("../utils/validator");
const { createVoucherValidation } = require('../validations/index').contractsValidation;

const {serverConfig} = require('../config/serverConfig')

const { VoucherQueries } = require('../queries/voucherQueries');
const { AppError, BadRequestError, BadGatewayError } = require('../errors/appError')
const { Utils } = require('../utils/utils');

const maxLimitDayVoucher = async (req, res, next) => {
    logger.debug(`maxLimitDayVoucher START, address: ${req.locals.address}`);
    let address = req.locals.address;
    let quantity = req.body.quantity;

    //validation
    const {error: validationError, value } = createVoucherValidation({address, quantity});

	if(validationError){

		logger.warn(`Input null or undefined, validationError: ${Utils.printErrorLog(validationError)}`);

		return next(new BadRequestError(
			`Input null or undefined, validationError: ${JSON.stringify(validationError)}`
		));
	}

    let vouchersCreated
    try {
        vouchersCreated = await VoucherQueries.getLastDayVouchersSum(address);
    } catch (error) {
        logger.error(`Error in VoucherQueries.getLastDayVouchers, error: ${Utils.printErrorLog(error)}`)
        return next(new BadGatewayError(`Error in VoucherQueries.getLastDayVouchers, error: ${Utils.printErrorLog(error)}`));
    }

    let totalVoucherCreated = 0;
    if(vouchersCreated?.length > 0 && vouchersCreated[0].somma) totalVoucherCreated = vouchersCreated[0].somma;

    if(totalVoucherCreated + quantity > Number(serverConfig.MAX_VOUCHER_VALUE)) 
        return next(new AppError(
            {
                logMessage: `Voucher too big, quantity: ${quantity}, totalVoucherCreated: ${totalVoucherCreated}, address: ${address}`,
                internalCode: 1
            },
            403,
            'FORBIDDEN',
            true,
            { errorMessage: `Your account has been banned` },
            1
        )
    )
    logger.debug(`maxLimitDayVoucher END`);

    return next();
}



module.exports = {
    maxLimitDayVoucher
}