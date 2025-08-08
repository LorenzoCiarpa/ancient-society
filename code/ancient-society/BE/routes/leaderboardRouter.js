const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const authController = require('../controllers/authController');
const {serverConfig} = require('../config/serverConfig')

const router = express.Router();

if(serverConfig.routes.leaderboard.general){
    router.post("/getLeaderboard", leaderboardController.getLeaderboard);
}

if(serverConfig.routes.leaderboard.fishing){
    router.post("/getLeaderboardFisherman", leaderboardController.getLeaderboardFisherman);
}

if(serverConfig.routes.leaderboard.crafting){
    router.post("/getLeaderboardCrafting", leaderboardController.getLeaderboardCrafting);
}

if(serverConfig.routes.leaderboard.challenge){
    router.post("/getLeaderboardChallenge", leaderboardController.getLeaderboardChallenge);
}

module.exports = router;