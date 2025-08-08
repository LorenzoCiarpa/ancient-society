const express = require('express');
const metaController = require('../controllers/metaController');

const router = express.Router();

function checkId(req, res ,next) {
    let id = req.params.id;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    if(isNaN(id)){
        return res
        .send("Not a valid id")
        .end();
    }
    
    next();
}
router.use("/townhall/:id", checkId);
router.use("/lumberjack/:id", checkId);
router.use("/stonemine/:id", checkId);
router.use("/fisherman/:id", checkId);
router.use("/miner/:id", checkId);
router.use("/land/:id", checkId);

router.get("/townhall/:id", metaController.getTownhallMeta);

router.get("/lumberjack/:id", metaController.getLumberjackMeta);

router.get("/stonemine/:id", metaController.getStonemineMeta);

router.get("/fisherman/:id", metaController.getFishermanMeta);

router.get("/miner/:id", metaController.getMinerMeta);

router.get("/farmer/:id", metaController.getFarmerMeta);

router.get("/land/:id", metaController.getLandMeta);

module.exports = router;
