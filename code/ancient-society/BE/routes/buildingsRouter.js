const express = require('express');
const buildingsController = require('../controllers/buildingsController')
const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');
const colonyMiddleware = require('../middlewares/colonyMiddleware');
const { serverConfig } = require('../config/serverConfig')

const router = express.Router();

router.post("/isCursed", buildingsController.isCursed);

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

// router.use(authController.isLoggedMiddleware);

router.use(authController.checkAccountSigned);
router.use(colonyMiddleware.isColony);

router.post("/setPosition", buildingsController.setPosition);
router.post("/isStake", buildingsController.isStake);
if (serverConfig.routes.prestige) {
    router.post("/getPrestigeData", buildingsController.getPrestigeData);
    router.post("/doPrestige", buildingsController.doPrestige);
}


router.post("/setPassiveOn", delegateMiddleware.isDelegatedHand);
router.post("/setPassiveOn", buildingsController.setPassiveOn);
router.post("/setPassiveOff", delegateMiddleware.isDelegatedHand);
router.post("/setPassiveOff", buildingsController.setPassiveOff);
router.post("/upgradePassive", delegateMiddleware.isDelegatedHand);
router.post("/upgradePassive", buildingsController.upgradePassive);

router.post("/upgradeNFT", delegateMiddleware.isDelegatedUpgrade);
router.post("/upgradeNFT", buildingsController.upgradeNFT);

router.post("/claim", delegateMiddleware.isDelegatedClaim);
router.post("/claim", buildingsController.claim);

router.use(delegateMiddleware.isDelegated);
router.post("/getAccountData", buildingsController.getAccountData);
router.post("/upgradeDone", buildingsController.upgradeDone);
router.post("/getNFT", buildingsController.getNFT);
router.post("/getNFTUpgradeRequirements", buildingsController.getNFTUpgradeRequirements);

// router.post("/setStake", buildingsController.setStake);
// router.post("/retrieveNFT", authController.signUp);

module.exports = router;