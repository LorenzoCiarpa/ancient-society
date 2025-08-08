const express = require('express');
const farmerController = require('../controllers/farmerController');
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

router.post("/getFarmer", delegateMiddleware.isDelegated);
router.post("/getFarmer", farmerController.getFarmer);
// router.post("/getFarmer", farmerController.getFarmer);

router.post("/repairHoe", delegateMiddleware.isDelegatedHand);
router.post("/repairHoe", InventoryController.repairTool);
router.post("/upgradeHoe", delegateMiddleware.isDelegatedInventory);
router.post("/upgradeHoe", farmerController.upgradeHoe);

router.use(delegateMiddleware.isDelegatedHand);
router.post("/changeHoe", farmerController.changeHoe);
router.post("/unEquipHoe", farmerController.unEquipHoe);
if (serverConfig.routes.farmer) {
    router.post("/startFarming", farmerController.startFarming);
}

router.post("/burnPassiveSeed", farmerController.burnPassiveSeed);
if (serverConfig.routes.farmer) {
    router.post("/startPassiveFarming", farmerController.startPassiveFarming);
}

module.exports = router;