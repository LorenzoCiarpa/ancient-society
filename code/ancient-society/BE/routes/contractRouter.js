//LIBRARIES
const express = require('express');
const rateLimit = require('express-rate-limit')
const { ReasonPhrases, StatusCodes, getReasonPhrase } = require('http-status-codes');

//CONTROLLERS
const contractsController = require('../controllers/contractsController');
const authController = require('../controllers/authController');

//MIDDLEWARES
const authMiddleware = require('../middlewares/authMiddleware');
const contractsMiddleware = require('../middlewares/contractsMiddleware');

//CONFIG
const {serverConfig} = require('../config/serverConfig')

//UTILS
const {Security} = require('../utils/index').security;
const Validator = require('../utils/index').validator;

//ERRORS
const {AppError} = require('../errors/index');

const router = express.Router();

const createVoucherLimiter = rateLimit({
	windowMs: 60 * 1000, // 60 seconds
	max: 3, 
    handler: async (req, res, next, options) =>  {
        //Could just add internalCode 1 and remove this ban, is redundant
        await Security.banJwt(req, 'Too many attempents at createVoucher');
        await Security.banAddress(req, 'Too many attempents at createVoucher');
        await Security.banIpAddress(req, 'Too many attempents at createVoucher');

        let address = req.locals.address;
        let jwtToken = req.locals.jwt;
        let ipAddressJwt = req.locals.ipAddress;
        let ipAddress = Validator.getIpAddress(req);

        return next(new AppError.AppError(
            {
                logMessage: `Too many req this account, address: ${address}, jwt: ${jwtToken}, ipAddressJwt: ${ipAddressJwt}, ipAddress: ${ipAddress}`,
                internalCode: 0
            },
            429,
            getReasonPhrase(429),
            false,
            {
                errorMessage: `Your account has been banned`
            },
            0
        ))
        // res.status(429).send("Too many request")
    },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.post("/isWhitelisted", contractsController.isWhitelisted);
if(serverConfig.routes.lands.available){
    router.post("/createLandVoucher", contractsController.createLandVoucher);
}
// router.post("/testIsOpen", contractsController.testIsOpen);
// router.post("/test", contractsController.fixLeader);


//SE non funziona elimina questo pezzo e decommenta


if(!process.env.NODE_SVIL){
    router.use(authController.isLoggedMiddleware);
}else{
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address,
            ipAddress: Validator.getIpAddress(req),
            
        }
        next();
    });
}
// router.use(authMiddleware.isDelegatedMiddleware);

if(serverConfig.routes.storage.withdraw){
    // router.post("/createVoucher", createVoucherLimiter);
    // router.post("/createVoucher", contractsMiddleware.maxLimitDayVoucher);
    router.post("/createVoucher", contractsController.createVoucher);

    router.post("/getAmountWithdrawable", contractsController.getAmountWithdrawable)
}

if(serverConfig.routes.storage.voucher){
    router.post("/getVouchers", contractsController.getVouchers);
    router.post("/getFarmerVoucher", contractsController.getFarmerVouchers);
    router.post("/createFarmerVoucher", contractsController.createFarmerVoucher);
}




module.exports = router;