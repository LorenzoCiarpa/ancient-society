const express = require('express');
const InventoryController = require('../controllers/inventoryController');
const authController = require('../controllers/authController');
const Sanitizer = require('../utils/sanitizer');
let sanitizer = new Sanitizer();
const loggerTrap = require("../logging/loggerTrap");
const {serverConfig} = require('../config/serverConfig')

const delegateMiddleware = require('../middlewares/delegateMiddleware');
const colonyMiddleware = require('../middlewares/colonyMiddleware');

const router = express.Router();

const messageToPirate = (req, res) => {
    
    let error = {};
    error.address = req.locals.address;
    error.ip = sanitizer.getIpAddress(req);
    error.timestamp = new Date().toISOString().slice(0, -1);
    error.warning = `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
    But also remember that we are logging everything.
    Unauthorized access is illegal.`

    loggerTrap.error(`Hacking Attempt: ${Utils.printErrorLog(error)}`)

    return res
    .status(401)
    .json({
        success: false,
        error: error
    });
}
    
if(!process.env.NODE_SVIL){
    router.use(authController.isLoggedMiddleware);
}else{
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address
        }
        next();
    });
}

router.use(authController.checkAccountSigned);
router.use(colonyMiddleware.isColony);

if(serverConfig.routes.npc){
    router.post("/getRecipeNPC", InventoryController.getRecipeNPC);
}
if(serverConfig.routes.landnpc){
    router.post("/getRecipeLandNPC", InventoryController.getRecipeLandNPC);
}
if(serverConfig.routes.gem.available){
    router.post("/getRecipeGem", InventoryController.getRecipeGem);
    router.post("/getBundleGem", InventoryController.getBundleGem);
}


router.post("/transformWithdrawable", InventoryController.createVoucher);

if(serverConfig.routes.npc){
    router.post("/getRecipeNPCInstance", delegateMiddleware.isDelegated);
    router.post("/getRecipeNPCInstance", InventoryController.getRecipeNPCInstance);
}

if(serverConfig.routes.landnpc){
    router.post("/getRecipeLandNPCInstance", delegateMiddleware.isDelegated);
    router.post("/getRecipeLandNPCInstance", InventoryController.getRecipeLandNPCInstance);
}

if(serverConfig.routes.gem.available){
    router.post("/getRecipeGemInstance", delegateMiddleware.isDelegated);
    router.post("/getRecipeGemInstance", InventoryController.getRecipeGemInstance);
}

if(serverConfig.routes.pvp){
    router.post("/craftToPvp", delegateMiddleware.isDelegated);
    router.post("/craftToPvp", InventoryController.craftToPvp);
}

if(serverConfig.routes.inventory){
    router.post("/getInventoryList", delegateMiddleware.isDelegated);
    router.post("/getInventoryList", InventoryController.getInventoryList);
    router.post("/getInventoryInstanceData", delegateMiddleware.isDelegated);
    router.post("/getInventoryInstanceData", InventoryController.getInventoryInstanceData);


    router.post("/sendRecipe", delegateMiddleware.isDelegatedTransfer);
    router.post("/sendRecipe", InventoryController.sendRecipe);
    router.post("/sendItem", delegateMiddleware.isDelegatedTransfer);
    router.post("/sendItem", InventoryController.sendItem);
    router.post("/sendTool", delegateMiddleware.isDelegatedTransfer);
    router.post("/sendTool", InventoryController.sendTool);

    router.use(delegateMiddleware.isDelegatedInventory);

    router.post("/openChest", InventoryController.openChest);

    router.post("/repairTool", InventoryController.repairTool);
    router.post("/upgradeTool", InventoryController.upgradeTool);

    router.post("/craft", InventoryController.craft);
}


if(serverConfig.routes.npc){
    router.post("/craftNPC", InventoryController.craftNPC);
}
if(serverConfig.routes.landnpc){
    router.post("/craftLandNPC", InventoryController.craftLandNPC);
}
if(serverConfig.routes.gem.available){
    router.post("/craftGem", InventoryController.craftGem);
}

if(serverConfig.routes.pvp) {
    router.post("/getPvpRecipeNPC", InventoryController.getPvpRecipeNPC);
    router.post("/getPvpRecipeNPCInstance", InventoryController.getPvpRecipeNPCInstance);
}



module.exports = router;