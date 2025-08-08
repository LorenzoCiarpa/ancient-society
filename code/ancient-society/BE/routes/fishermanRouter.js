const express = require('express');
const fishermanController = require('../controllers/fishermanController');
const InventoryController = require('../controllers/inventoryController');
const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');
const colonyMiddleware = require('../middlewares/colonyMiddleware');
const { serverConfig } = require('../config/serverConfig')

const router = express.Router();

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

router.use(authController.checkAccountSigned);
router.use(colonyMiddleware.isColony);

// router.use(delegateMiddleware.isDelegated)

router.post("/getFisherman", delegateMiddleware.isDelegated);
router.post("/getFisherman", fishermanController.getFisherman);
// router.post("/getFisherman", fishermanController.getFisherman);

router.post("/repairRod", delegateMiddleware.isDelegatedHand);
router.post("/repairRod", InventoryController.repairTool);
router.post("/upgradeRod", delegateMiddleware.isDelegatedInventory);
router.post("/upgradeRod", fishermanController.upgradeRod);

router.use(delegateMiddleware.isDelegatedHand);
router.post("/changeRod", fishermanController.changeRod);
router.post("/unEquipRod", fishermanController.unEquipRod);

if (serverConfig.routes.fishing) {
    router.post("/startFishing", fishermanController.startFishing);
}

router.post("/burnPassiveLure", fishermanController.burnPassiveLure);

if (serverConfig.routes.fishing) {
    router.post("/startPassiveFishing", fishermanController.startPassiveFishing);
}


module.exports = router;