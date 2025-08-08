const express = require('express');
const serverController = require('../controllers/serverController');
const authController = require('../controllers/authController');
const {serverConfig} = require('../config/serverConfig')

const router = express.Router();

router.post("/getInfo", serverController.getInfo);

router.post("/getBrokenMarketplace", serverController.getBrokenMarketplace);

if (!process.env.NODE_SVIL) {
    router.use(authController.isLoggedMiddleware);
} else {
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address
        }
        next();
    });
}

router.post("/setReferalInstance", serverController.setReferalInstance);
// router.post("/createVoucher", serverController.createVoucher);
// router.post("/getVouchers", serverController.getVouchers);



module.exports = router;