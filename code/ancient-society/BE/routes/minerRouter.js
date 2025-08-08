const express = require('express');
const minerController = require('../controllers/minerController');
const InventoryController = require('../controllers/inventoryController');
const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');
const colonyMiddleware = require('../middlewares/colonyMiddleware');
const {serverConfig} = require('../config/serverConfig')

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

router.post("/getMiner", delegateMiddleware.isDelegated);
router.post("/getMiner", minerController.getMiner);
// router.post("/getMiner", minerController.getMiner);

router.post("/repairAxe", delegateMiddleware.isDelegatedHand);
router.post("/repairAxe", InventoryController.repairTool);
router.post("/upgradeAxe", delegateMiddleware.isDelegatedInventory);
router.post("/upgradeAxe", minerController.upgradeAxe);

router.use(delegateMiddleware.isDelegatedHand);
router.post("/changeAxe", minerController.changeAxe);
router.post("/unEquipAxe", minerController.unEquipAxe);
if(serverConfig.routes.miner){
    router.post("/startMining", minerController.startMining);
}


router.post("/burnPassiveTNT", minerController.burnPassiveTNT);
if(serverConfig.routes.miner){
    router.post("/startPassiveMining", minerController.startPassiveMining);
}


module.exports = router;