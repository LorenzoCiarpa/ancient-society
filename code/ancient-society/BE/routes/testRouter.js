const express = require('express');
const testController = require('../controllers/testController');
const authController = require('../controllers/authController');
const {serverConfig} = require('../config/serverConfig')


const router = express.Router();

// router.use(testController.testFunction);

// router.get("/getInventory", testController.testGetInventory);

// router.post("/getUser", testController.testGetUser);


module.exports = router;