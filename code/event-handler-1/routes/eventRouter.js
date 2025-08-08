const express = require('express');

// const alphaController = require('../controllers/alphaMarketplace');

// const buildingController = require('../controllers/buildingController');

//NOT TESTED YET
// const gemMarketplaceHandler = require('../controllers/gemMarketplaceHandler'); 

// const landcontractController = require('../controllers/landcontractController');
// const landController = require('../controllers/landController');
// const landStakingController = require('../controllers/landStakingController');

// const liquidityController = require('../controllers/liquidityController');

// const resourceController = require('../controllers/resourceController');
const stakingController = require('../controllers/stakingController');



const router = express.Router();

// router.post("/testo", async (req, res) => {
//     let result
//     try{
//         result = await web3.eth.getBlockNumber();
//     }catch(error){
//         console.log("error in getBlockNumber: ", error)

//     }

//     console.log("blockNumber: ",result)

//     return res
//     .json({
//         result: result
//     })
// });

// router.get("/townhall/:id", metaController.getTownhallMeta);

// router.get("/lumberjack/:id", metaController.getLumberjackMeta);

// router.get("/stonemine/:id", metaController.getStonemineMeta);



module.exports = router;