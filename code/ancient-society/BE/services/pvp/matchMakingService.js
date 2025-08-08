const logger = require('../../logging/logger');
const random = require('random');
const arpad = require('arpad');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig');
const { MatchMakingQueries } = require('../../queries/pvp/matchMakingQueries');
const { UserQueries } = require('../../queries/pvp/userQueries');
const { PvpHelper } = require('../../helpers/pvp/pvpHelper');
const { ItemQueries } = require('../../queries/pvp/inventory/itemQueries');
const { RecipeQueries } = require('../../queries/pvp/inventory/recipeQueries');
const Validator = require('../../utils/validator');
const { CardQueries } = require('../../queries/pvp/inventory/cardQueries');
const { GearQueries } = require('../../queries/pvp/inventory/gearQueries');
const { BattleQueries } = require('../../queries/pvp/battleQueries');
const Elo = new arpad(serverConfig.matchmaking.uscf,serverConfig.matchmaking.MIN_TROPHIES,serverConfig.matchmaking.MAX_TROPHIES)
class MatchMakingService{
    constructor () {}

    static async joinQueueService(address,trophies){
        let check
        try {
            check = await MatchMakingQueries.checkQueue(address) 
        } catch (error) {
            logger.error(`Error in checkQueue :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(check.length != 0){
            throw('user already in queue')
        }
        // let checkWar
        // try {
        //     checkWar = await MatchMakingQueries.checkWar(address) 
        // } catch (error) {
        //     logger.error(`Error in checkWar :${Utils.printErrorLog(error)}`)
        //     throw (error)
        // }
        // if(checkWar.length > serverConfig.MAX_ACTIVE_WARS - 1){
        //     throw('Wait for the end of your active battles before searching for a new one!')
        // }



        logger.debug("start matchmaking")
        let match
        try {
            match = await this.matchPlayers(address,trophies) 
        } catch (error) {
            logger.error(`Error in matchPlayers :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(match){
            if(match.message){
                let check
                try {
                    check = await MatchMakingQueries.checkQueue(address) 
                } catch (error) {
                    logger.error(`Error in checkQueue :${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if(check.length != 0){
                    throw('user already in queue')
                }
                let insert
                try {
                    insert = await MatchMakingQueries.insertInQueue(address,trophies);
                } catch (error) {
                    logger.error(`Error in insertInQueue :${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                if(insert.affectedRows!=1){
                    throw 'error inserting player in queue'
                }
            }
            return match
        }else{
            return 0
        }
        
    }

    static async leaveQueueService(address){
        let check
        try {
            check = await MatchMakingQueries.checkQueue(address) 
        } catch (error) {
            logger.error(`Error in checkQueue :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(check.length == 0){
            throw('user not in queue')
        }
        // let checkWar
        // try {
        //     checkWar = await MatchMakingQueries.checkWar(address);
        // } catch (error) {
        //     logger.error(`Error in insertInQueue :${Utils.printErrorLog(error)}`)
        //     throw (error)
        // }
        // logger.debug(`checkWar : ${JSON.stringify(checkWar)}`)
        // if(checkWar.length != 0){
        //     return checkWar[0].idWar
        // }else{
        let del
        try {
            del = await MatchMakingQueries.removeFromQueue(address);
        } catch (error) {
            logger.error(`Error in removeFromQueue :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(del.affectedRows!=1){
            throw 'error removing player from the queue'
        }
        return "Player correctly removed"

        
    }

    static async matchPlayers(address,trophies){
        let queue
        try {
            queue = await MatchMakingQueries.getQueue(address) 
        } catch (error) {
            logger.error(`Error in checkWar :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let opponent
        for(let player of queue){
            logger.debug(`Player info : ${JSON.stringify(player)}`)
            let playerRange = player.range
            let playerTrophies = player.trophies
            let playerAddres = player.address
            logger.debug(`printing range: min ${playerTrophies-playerRange}, max ${playerTrophies+playerRange}`)
            if((trophies>playerTrophies-playerRange) && (trophies<playerTrophies+playerRange)){
                opponent = playerAddres
                logger.debug(`Opponent should be : ${JSON.stringify(opponent)}`)
                break
            }
        }
        
        if(opponent){
            // let remove1
            // try {
            //     remove1 = await MatchMakingQueries.removeFromQueue(address) 
            // } catch (error) {
            //     logger.error(`Error in removeFromQueue :${Utils.printErrorLog(error)}`)
            //     throw (error)
            // }
            let remove2
            try {
                remove2 = await MatchMakingQueries.removeFromQueue(opponent) 
            } catch (error) {
                logger.error(`Error in removeFromQueue :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(remove2.affectedRows !=1){
                throw('Could not remove a player from the queue')
            }
            //randomize arena
            let arena,idArena;
            try {
                arena = await this.randomizeArena() 
            } catch (error) {
                logger.error(`Error in randomizeArena :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            logger.debug(`random arena:${JSON.stringify(arena)}`);
            idArena = arena.idArena
            //randomize affixes
            let affixes
            try {
                affixes = await this.randomizeAffixes() 
            } catch (error) {
                logger.error(`Error in randomizeAffixes :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            logger.debug(`random affixes :${JSON.stringify(affixes)}`);
            let war
            try {
                war = await MatchMakingQueries.insertInWar(address,opponent,idArena) 
            } catch (error) {
                logger.error(`Error in insertInWar :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(war.affectedRows != 1) throw ("could not create war between the players")
            let warId = war.insertId

            //affixes
            let ins
            try {
                ins = await MatchMakingQueries.insertAffixes(affixes,warId) 
            } catch (error) {
                logger.error(`Error in insertAffixes :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(ins.affectedRows != 1) throw("Could not insert affixes");
            let update;
            try {
                update = await MatchMakingQueries.updateMatchCount(address,opponent) 
            } catch (error) {
                logger.error(`Error in updateMatchCount :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(update.affectedRows != 2) throw("Could not update the total match count of both players")

            return {opponent,warId}

        }else{
            return {message:"No opponent found, waiting ..."}
        }
    }

    static async fixRoutine(){
        let ret=[];
        let wars
        try {
            wars = await MatchMakingQueries.getWarsToFix() 
        } catch (error) {
            logger.error(`Error in getWarsToFix :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`wars to fix : ${JSON.stringify(wars)}`)
        if(wars.length < 1){
            return {message:'There are no wars to fix'}
        }
        
        for(let war of wars){
            ret.push(war.idWar);
            let arena,idArena;
            try {
                arena = await this.randomizeArena() 
            } catch (error) {
                logger.error(`Error in randomizeArena :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            logger.debug(`random arena:${JSON.stringify(arena)}`);
            idArena = arena.idArena
            let insArena
            try {
                insArena = await MatchMakingQueries.insertArenaGivenIdWar(idArena,war.idWar) 
            } catch (error) {
                logger.error(`Error in randomizeArena :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            let affixes
            try {
                affixes = await this.randomizeAffixes() 
            } catch (error) {
                logger.error(`Error in randomizeAffixes :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            logger.debug(`random affixes :${JSON.stringify(affixes)}`);
            let ins
            try {
                ins = await MatchMakingQueries.insertAffixes(affixes,warId) 
            } catch (error) {
                logger.error(`Error in insertAffixes :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(ins.affectedRows != 1) throw("Could not insert affixes")

        }
        return ret;
    }

    static async matchRoutine(){
        let queue
        try {
            queue = await MatchMakingQueries.getWholeQueue() 
        } catch (error) {
            logger.error(`Error in checkWar :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`Queue : ${JSON.stringify(queue)}`)
        if(queue.length == 0){
            return "No players in queue"
        }
        let matchCounter = 0
        let addresses=[]
        for(let player of queue){
            addresses.push(player.address)
            let newRange
            if(player.timeInQueue<serverConfig.matchmaking.TIME1) continue
            if(player.timeInQueue>serverConfig.matchmaking.TIME1) newRange = serverConfig.matchmaking.RANGE1
            if(player.timeInQueue>serverConfig.matchmaking.TIME2) newRange = serverConfig.matchmaking.RANGE2
            if(player.timeInQueue>serverConfig.matchmaking.TIME3) newRange = serverConfig.matchmaking.RANGE3
            let update
            logger.debug(`Updating player range : player:${player.address}, new range : ${newRange}`)
            try {
                update = await MatchMakingQueries.updateRangeQueue(player.address,newRange) 
            } catch (error) {
                logger.error(`Error in MatchMakingQueries updateRangeQueue :${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if(update.affectedRows!=1) throw("failed to update the player range")
            player.range = newRange
        }

        logger.debug(`addresses : ${JSON.stringify(addresses)}, updated queue ${JSON.stringify(queue)}`)


        for(let player of queue){
            if (addresses.includes(player.address)){
                
                let matched
                try {
                    matched = await this.matchPlayers(player.address,player.trophies) 
                } catch (error) {
                    logger.error(`Error in  matchPlayers :${Utils.printErrorLog(error)}`)
                    throw (error)
                }
                logger.debug(`MATCHED RESULT${JSON.stringify(matched)}`)
                if(matched){
                    logger.debug(`Matched player ${player.address} with player ${matched.opponent}`)
                    addresses = addresses.filter(item => item !== player.address)
                    addresses = addresses.filter(item => item !== matched.opponent)
                    matchCounter ++
                }
            }
        }
        return matchCounter
    }

    static async battleSimulator(player1,player2){
        if(random.int(0,100)<50) return player1
        else return player2
    }

    static async eloHandler(winner,loser){
        //retrieve trophies 

        let newTrophiesWinner,newTrophiesLoser,trophiesWinner,trophiesLoser
        let winnerInfo, loserInfo
        //winner stuff
        try {
            winnerInfo = await BattleQueries.getTrophiesFromAddress(winner)
        } catch (error) {
            logger.error(`Error in  getTrophiesFromAddress :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`winner infos:${JSON.stringify(winnerInfo)}`)
        if(winnerInfo[0] == null || winnerInfo[0] == undefined){
            throw("Could not retrieve winner Info");
        }
        winnerInfo=winnerInfo[0]
        trophiesWinner = winnerInfo.warPoints
        if(trophiesWinner == null || trophiesWinner == undefined){
            throw(`Could not retrieve winner's trophies`)
        }
        let winnerCurrentReward= winnerInfo.dailyReward
        let winnerLeague= winnerInfo.idLeague || 1
        let maxWinWinner
        let pointsToAddWinner = random.int(1,serverConfig.matchmaking.maxPointsPerGame[winnerLeague])

        maxWinWinner = serverConfig.matchmaking.maxPointsPerDay[winnerLeague];
        if(winnerCurrentReward < maxWinWinner){
            if(winnerCurrentReward + pointsToAddWinner > maxWinWinner) pointsToAddWinner = maxWinWinner - winnerCurrentReward
        }
        if(winnerCurrentReward >= maxWinWinner) pointsToAddWinner = 0
        
        let nextLeagueWinner
        try {
            nextLeagueWinner = await BattleQueries.getNextLeauge(winnerLeague)
        } catch (error) {
            logger.error(`Error in  getNextLeauge :${Utils.printErrorLog(error)}`)
            throw (error)
        }



        //looser stuff
        try {
            loserInfo = await BattleQueries.getTrophiesFromAddress(loser)
        } catch (error) {
            logger.error(`Error in  getTrophiesFromAddress :${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if(loserInfo[0] == null || loserInfo[0] == undefined){
            throw("Could not retrieve winner Info");
        }
        loserInfo=loserInfo[0]
        trophiesLoser = loserInfo.warPoints
        if(trophiesLoser == null || trophiesLoser == undefined){
            throw(`Could not retrieve looser's trophies`)
        }
        let loserCurrentReward= loserInfo.dailyReward
        let loserLeague= loserInfo.idLeague || 1
        let maxWinLoser
        let pointsToAddLoser = random.int(1,serverConfig.matchmaking.maxPointsPerGame[loserLeague])

        maxWinLoser = serverConfig.matchmaking.maxPointsPerDay[loserLeague];
        if(loserCurrentReward < maxWinLoser){
            if(loserCurrentReward + pointsToAddLoser > maxWinLoser) pointsToAddWinner = maxWinLoser - loserCurrentReward
        }
        if(loserCurrentReward >= maxWinLoser) pointsToAddLoser = 0

        let leagueLoser
        try {
            leagueLoser = await BattleQueries.getLeauge(loserLeague)
        } catch (error) {
            logger.error(`Error in  getPrevLeauge :${Utils.printErrorLog(error)}`)
            throw (error)
        }


        newTrophiesWinner = Elo.newRatingIfWon(trophiesWinner,trophiesLoser);
        newTrophiesLoser = Elo.newRatingIfLost(trophiesLoser,trophiesWinner);
        logger.debug(`Trophies for winner ${winner} from ${trophiesWinner} to ${newTrophiesWinner}`);
        logger.debug(`Trophies for loser ${loser} from ${trophiesLoser} to ${newTrophiesLoser}`);
        //updateWinner and loser
        let promoteWinner = false
        if(nextLeagueWinner != null && nextLeagueWinner != undefined){
            if(newTrophiesWinner >= nextLeagueWinner[0].minTrophies)
                promoteWinner = true
        }
        let demoteLoser = false
        if(loserLeague - 1 > 0){
            if(newTrophiesLoser < leagueLoser[0].minTrophies)
                demoteLoser = true
        }
        let update
        try {
            update = await MatchMakingQueries.updateWinner(winner,newTrophiesWinner,pointsToAddWinner,promoteWinner)
        } catch (error) {
            logger.error(`Error in  updateWinner :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(update.affectedRows!=1){
            throw("Could not update winner match count and trophies")
        }
        try {
            update = await MatchMakingQueries.updateUserTrophiesAndReward(loser,newTrophiesLoser,pointsToAddLoser,demoteLoser)
        } catch (error) {
            logger.error(`Error in  updateUserTrophies :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(update.affectedRows!=1){
            throw("Could not update loser trophies")
        }

        let response = {}
        response.winner=winner;
        response.loser=loser;
        response.newTrophiesWinner=newTrophiesWinner;
        response.newTrophiesLoser=newTrophiesLoser;
        response.oldTrophiesLoser=trophiesLoser;
        response.oldTrophiesWinner=trophiesWinner
        return response;
    }

    static async randomizeArena(){
        let arenas
        try {
            arenas = await MatchMakingQueries.getAllArenas() 
        } catch (error) {
            logger.error(`Error in MatchMakingQueries getAllArenas :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if(arenas.length<1) throw("Could not retrieve arenas")
        let randomIndex = random.int(0,arenas.length-1)
        return arenas[randomIndex]
    }

    static async randomizeAffixes(){
        let affixes
        try {
            affixes = await MatchMakingQueries.getAllAffixes() 
        } catch (error) {
            logger.error(`Error in MatchMakingQueries getAllAffixes :${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`all affixes retrieved : ${JSON.stringify(affixes)}`);
        if(affixes.length<1) throw("Could not retrieve affixes");

        let turn1=[],turn2=[],turn3 = [];
        let t1=[],t2=[],t3=[];

        for(let i=0;i<3;i++){ //number of turns
            for(let j=0;j<serverConfig.matchmaking.AFFIXES;j++){
                let randomIndex = random.int(0,affixes.length-1)
                // console.log(randomIndex);
                // console.log(affixes[randomIndex]);
                switch (i) {
                    case 0:
                        while (t1.some(e => e.pool === affixes[randomIndex].pool)) {
                            randomIndex = random.int(0,affixes.length-1)
                        }
                        turn1.push(affixes[randomIndex].idAffix);
                        t1.push(affixes[randomIndex]);
                        break;
                    case 1:
                        while (t2.some(e => e.pool === affixes[randomIndex].pool)) {
                            randomIndex = random.int(0,affixes.length-1)
                        }
                        turn2.push(affixes[randomIndex].idAffix);
                        t2.push(affixes[randomIndex]);
                        break;
                    case 2:
                        while (t3.some(e => e.pool === affixes[randomIndex].pool)) {
                            randomIndex = random.int(0,affixes.length-1)
                        }
                        turn3.push(affixes[randomIndex].idAffix);
                        t3.push(affixes[randomIndex]);
                        break;
                }
                affixes.splice(randomIndex,1);
            }
        }
        let res = {}
        res.turn1 = turn1.join();
        res.turn2=turn2.join();
        res.turn3=turn3.join();

        console.log(res)
        return res

    }

}

module.exports = {MatchMakingService}