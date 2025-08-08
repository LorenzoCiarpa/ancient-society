const { validation } = require('./validation')
const Joi = require('joi')
const { serverConfig } = require('../config/serverConfig')

const createVoucherSchema = Joi.object({
    address: Joi.string().pattern(new RegExp('^0x[a-fA-F0-9]{40}$')).required(),
    quantity: Joi.number().min(1).max(Number(serverConfig.MAX_VOUCHER_VALUE)).required() 
})

module.exports.createVoucherValidation = validation(createVoucherSchema)