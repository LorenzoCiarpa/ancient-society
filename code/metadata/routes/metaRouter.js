const express = require('express');
const metaController = require('../controllers/metaController');

const router = express.Router();

// router.get("/townhall/:id", metaController.getTownhallMeta);

// router.get("/lumberjack/:id", metaController.getLumberjackMeta);

// router.get("/stonemine/:id", metaController.getStonemineMeta);

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


router.get("/townhall/:id", checkId);

router.get("/lumberjack/:id", checkId);

router.get("/stonemine/:id", checkId);

router.get("/fisherman/:id", checkId);


router.get("/townhall/:id", metaController.getTownhallMetaPrereveal);

router.get("/lumberjack/:id", metaController.getLumberjackMetaPrereveal);

router.get("/stonemine/:id", metaController.getStonemineMetaPrereveal);

router.get("/fisherman/:id", metaController.getFishermanMetaPrereveal);



module.exports = router;