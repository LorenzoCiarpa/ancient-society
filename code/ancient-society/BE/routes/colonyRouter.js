const express = require('express')
const authController = require('../controllers/authController')
const colonyController = require('../controllers/colonyController')
const { serverConfig } = require('../config/serverConfig')
const colonyMiddleware = require('../middlewares/colonyMiddleware');

const router = express.Router()

if (!process.env.NODE_SVIL) {
  router.use(authController.isLoggedMiddleware)
} else {
  router.use((req, res, next) => {
    req.locals = {
      address: req.body.address
    }
    next()
  })
}

if (serverConfig.routes.colony) {
  router.post("/addColony", colonyController.addColony)
  router.post("/getColonies", colonyController.getColonies)

  router.post("/transferNftToColony", colonyController.transferNftToColony);
  router.use(colonyMiddleware.isColony);
  router.post("/transferNftToMain", colonyController.transferNftToMain);
}


module.exports = router