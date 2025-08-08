const express = require('express');
const devController = require('../controllers/devController');
const { serverConfig } = require('../config/serverConfig')

const router = express.Router();





if (serverConfig.routes.dev) {
    router.post("/getChallengeWinners", devController.getChallengeWinners);
    router.post("/matchmakingRoutine", devController.matchmakingRoutine);
}

module.exports = router;