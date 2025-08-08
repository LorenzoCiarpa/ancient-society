const express = require('express');
const pvpController = require('../controllers/pvpController');

const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');
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

// router.use(authController.checkAccountSigned);

if (serverConfig.routes.pvp) {
    router.post("/craftPvp", pvpController.craftPvp);
    router.post("/openChestPvp", pvpController.openChestPvp);
    router.post("/getInventoryListPvp", pvpController.getInventoryList);
    router.post("/getInventoryInstancePvp", pvpController.getInventoryInstanceData);
    router.post("/getCardList", pvpController.getCardList);
    router.post("/getCardInstance", pvpController.getCardInstance);
    router.post("/getLeaderboard", pvpController.getLeaderboard);
    router.post("/getWarHistory", pvpController.getWarHistory);
    router.post("/signUp", pvpController.signUp);
    router.post("/isSigned", pvpController.isSigned);
    router.post("/upgradeGear", pvpController.upgradeGear);
    router.post("/upgradeCard", pvpController.upgradeCard);
    router.post("/sendRecipe", pvpController.sendRecipe);
    router.post("/sendItem", pvpController.sendItem);
    router.post("/sendCard", pvpController.sendCard)
    router.post("/sendGear", pvpController.sendGear);
    router.post("/joinQueue", pvpController.joinQueue);
    router.post("/leaveQueue", pvpController.leaveQueue);
    router.post("/checkMatchmaking", pvpController.checkMatchmaking);
    router.post("/changeGear", pvpController.changeGear);
    router.post("/unequipGear", pvpController.unequipGear);
    router.post("/battle", pvpController.battle);
    router.post("/createBattle", pvpController.createBattle);
    router.post("/getActiveWar", pvpController.getActiveWar);
    router.post("/getUserInfoPvp", pvpController.getUserInfoPvp);
    router.post("/checkQueueStatus", pvpController.checkQueueStatus);
    router.post("/test", pvpController.battleServiceTest);
    router.post("/getAffix", pvpController.getAffix);
    router.post("/getAllAffixes", pvpController.getAllAffixes);
    router.post("/craftPvpNPC", pvpController.craftPvpNPC);
    router.post("/getActiveWarInfo", pvpController.getActiveWarInfo);
    router.post("/getWarInstanceHistory", pvpController.getWarInstanceHistory);
    router.post("/getNotifications", pvpController.getNotifications);
    router.post("/setNotificationSeen", pvpController.setNotificationSeen);
    router.post("/craftGemPvp",pvpController.craftGemPvp);
    router.post("/getRecipeGemInstancePvp",pvpController.getRecipeGemInstancePvp);
    router.post("/getRecipeGemPvp",pvpController.getRecipeGemPvp);
    router.post("/getBundleGemPvp",pvpController.getBundleGemPvp);
}

module.exports = router