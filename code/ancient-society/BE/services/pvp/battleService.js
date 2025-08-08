const logger = require('../../logging/logger');
const random = require('random');
const { Utils } = require("../../utils/utils");
const { serverConfig } = require('../../config/serverConfig');
const { InventoryQueries } = require('../../queries/pvp/inventoryQueries');
const { UserQueries } = require('../../queries/pvp/userQueries');
const { PvpHelper } = require('../../helpers/pvp/pvpHelper');
const { ItemQueries } = require('../../queries/pvp/inventory/itemQueries');
const { RecipeQueries } = require('../../queries/pvp/inventory/recipeQueries');
const Validator = require('../../utils/validator');
const { CardQueries } = require('../../queries/pvp/inventory/cardQueries');
const { GearQueries } = require('../../queries/pvp/inventory/gearQueries');
const { BattleQueries } = require('../../queries/pvp/battleQueries');
const { Card,BattleField } = require('../../models/pvpModel');


class BattleService {
    constructor (){}


    static async getCardsInfo(singleTurnDisposition,legendaryId,affixIds,playerAddress){
        //the matrix will come already validated
        //verify card properties and gear properties
        //single query with several joins and then we build the objects for every card
        //console.log("matrix",singleTurnDisposition)
        let rows = singleTurnDisposition.length
        let columns = singleTurnDisposition[0].length
        let legendaryInfo
        affixIds=affixIds.split(",")
        //console.log("aff",affixIds)
        if(legendaryId != null){
            //retrieve the buffs from db cardLevel

            try {
                legendaryInfo = await BattleQueries.getLegendaryCard(legendaryId)
            } catch (error) {
                logger.error(`Error in BattleQueries.getLegendaryCard: ${Utils.printErrorLog(error)}`);
                throw error
            }
            if(legendaryInfo.length != 1 )
                throw("Error retrieving legendaryCard")
            logger.debug(`LegendaryInfo retrieved : ${JSON.stringify(legendaryInfo)}`);
            legendaryInfo=legendaryInfo[0]
        }
        let affixes=[]
        for(let affix of affixIds){
            let affixInfo
            //console.log("retrieving",affix)
            try {
                affixInfo = await BattleQueries.getAffix(affix)
            } catch (error) {
                logger.error(`Error in BattleQueries.getAffix: ${Utils.printErrorLog(error)}`);
                throw error
            }
            
            if(affixInfo.length!=1){
                throw("Error retrieving affix")
            }
            affixes.push(affixInfo[0])
        }
        //logger.debug(`Retrieved affixes:${JSON.stringify(affixes)}`)

        let finalCards=[]
        let cardInfoM=[]
        for(let i=0;i<rows;i++){
            let cardRow=[]
            for(let j=0;j<columns;j++){
                if(singleTurnDisposition[i][j] == null){
                    cardRow.push(null)
                    continue
                } 
                //console.log(singleTurnDisposition[i][j])
                let cardInfo
                cardInfo = cardInfoM.find(element => element.idCardInstance == singleTurnDisposition[i][j]);
                if(!cardInfo){
                    try {
                        cardInfo = await BattleQueries.getCardInstanceInfo(singleTurnDisposition[i][j])
                    } catch (error) {
                        logger.error(`Error in BattleQueries.getCardInstanceInfo: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    if(cardInfo.length !=1 ) throw("Error retrieving the cardInfo")
                    cardInfo = cardInfo[0]
                    cardInfoM.push(cardInfo)
                }
                let card = new Card(singleTurnDisposition[i][j],cardInfo.idCard,cardInfo.name,cardInfo.level,cardInfo.category,cardInfo.rarity,cardInfo.attack,cardInfo.hp,cardInfo.speed,cardInfo.range,i,j,playerAddress,cardInfo.image);
                //buffs and debuffs section
                //talisman
                if(cardInfo.talisman){
                    switch (cardInfo.talismanType) {
                        case "ATK":
                            if(cardInfo.talismanFlat)
                                card.addAttack(cardInfo.talismanFlat)
                            if(cardInfo.talismanPerc)
                                card.buffAttack(cardInfo.talismanPerc)                            
                            break;
                        case "HP":
                            if(cardInfo.talismanFlat)
                                card.addHp(cardInfo.talismanFlat)
                            if(cardInfo.talismanPerc)
                                card.buffHp(cardInfo.talismanPerc)                          
                            break;
                        case "SPD":
                            if(cardInfo.talismanFlat)
                                card.addSpeed(cardInfo.talismanFlat)
                            if(cardInfo.talismanPerc)
                                card.buffSpeed(cardInfo.talismanPerc)                                                                            
                            break;
                        case "RNG":
                            if(cardInfo.talismanFlat)
                                card.addRange(cardInfo.talismanFlat)
                            if(cardInfo.talismanPerc)
                                card.buffRange(cardInfo.talismanPerc)                                                           
                            break;
                    }
                }
                //shield
                if(cardInfo.shield){
                    if(cardInfo.shieldFlat) card.addHp(cardInfo.shieldFlat);
                    if(cardInfo.shieldPerc) card.buffHp(cardInfo.shieldPerc);  
                }
                //weapon
                if(cardInfo.weapon){
                    if(cardInfo.weaponFlat) card.addAttack(cardInfo.weaponFlat);
                    if(cardInfo.weaponPerc) card.buffAttack(cardInfo.weaponPerc);  
                }

                //affixes
                for(let affix of affixes){
                    if(affix.effectOnCategory == card.getType() || affix.idCard == card.getIdCard() ){
                        if(affix.buff){
                            switch (affix.effectOnAttribute) {
                                case "ATK":
                                    if(affix.percentage) card.buffAttack(affix.percentage)
                                    if(affix.flat) card.addAttack(affix.flat)
                                    break;
                            
                                case "SPD":
                                    if(affix.percentage) card.buffSpeed(affix.percentage)
                                    if(affix.flat) card.addSpeed(affix.flat)
                                    break;

                                case "HP":
                                    if(affix.percentage) card.buffHp(affix.percentage)
                                    if(affix.flat) card.addHp(affix.flat)
                                    break;
                                case "RNG":
                                    if(affix.percentage) card.buffRange(affix.percentage)
                                    if(affix.flat) card.addRange(affix.flat)
                                    break;
                            }
                        }else{
                            switch (affix.effectOnAttribute) {
                                case "ATK":
                                    if(affix.percentage) card.debuffAttack(affix.percentage)
                                    if(affix.flat) card.subAttack(affix.flat)
                                    break;
                            
                                case "SPD":
                                    if(affix.percentage) card.debuffSpeed(affix.percentage)
                                    if(affix.flat) card.subSpeed(affix.flat)
                                    break;

                                case "HP":
                                    if(affix.percentage) card.debuffHp(affix.percentage)
                                    if(affix.flat) card.subHp(affix.flat)
                                    break;
                                case "RNG":
                                    if(affix.percentage) card.debuffRange(affix.percentage)
                                    if(affix.flat) card.subRange(affix.flat)
                                    break;
                            }
                        }   
                    }else continue
                }

                //legendary buff
                if(legendaryInfo){
                    //logger.debug("Buff leggendario")
                    if(legendaryInfo.buffCategory == card.getType()){
                        switch (legendaryInfo.buffAttribute) {
                            case "ATK":
                                card.buffAttack(legendaryInfo.buffPercentage)
                                break;
                            case "HP":
                                card.buffHp(legendaryInfo.buffPercentage)
                                break;
                            case "SPD":
                                card.buffSpeed(legendaryInfo.buffPercentage)
                                break;
                            case "RNG":
                                card.buffRange(legendaryInfo.buffPercentage)
                                break;
                        }
                    }
                }

                cardRow.push(card)
                
            }
            finalCards.push(cardRow);
        }
        //logger.debug(`All the cards in this turn:${JSON.stringify(finalCards)}`)
        return finalCards
    }

    static async getMatchInfo(idWar){
        let response

        try {
            response = await BattleQueries.getTurnsInfo(idWar)
        } catch (error) {
            logger.error(`Error in BattleQueries.getTurnsInfo: ${Utils.printErrorLog(error)}`);
            throw error
        }
        
        if(response.length == 0 ) throw ("Error retrieving turns info")
        
        let player1 = response[0].address

        let p1Turns = [],p2Turns= []

        for(let turn of response){
            if(turn.address == player1) p1Turns.push(turn)
            else p2Turns.push(turn)
        }
        //console.log("turns",p1Turns,p2Turns)

        return {p1Turns:p1Turns,
                p2Turns:p2Turns}

    }

    static async getAllReadyIdWars(){
        let response = [];

        try {
            wars = await BattleQueries.getTurnsInfo(idWar)
        } catch (error) {
            logger.error(`Error in BattleQueries.getTurnsInfo: ${Utils.printErrorLog(error)}`);
            throw error
        }
        
        if(response.length == 0 ) throw ("Error retrieving turns info")
        
        let player1 = response[0].address

        let p1Turns = [],p2Turns= []

        for(let turn of response){
            if(turn.address == player1) p1Turns.push(turn)
            else p2Turns.push(turn)
        }
        console.log("turns",p1Turns,p2Turns)

        return {p1Turns:p1Turns,
                p2Turns:p2Turns}

    }

    static async getWarInstanceHistoryService(idWar){
        let response={},history

        try {
            history = await BattleQueries.getWarHistory(idWar)
        } catch (error) {
            logger.error(`Error in BattleQueries.getWarHistory: ${Utils.printErrorLog(error)}`);
            throw error
        }
        
        if(history.length == 0 ) throw ("Error retrieving war history infos")
        history=history[0]
        
        response.turn1=JSON.parse(history.turn1)
        response.turn1Winner = history.winner1
        response.turn2=JSON.parse(history.turn2)
        response.turn2Winner = history.winner2
        response.turn3=JSON.parse(history.turn3)
        response.turn3Winner = history.winner3
        response.fieldRows = response.turn1[0].length
        response.fieldColumns = response.turn1[0][0].length
        response.backImage = history.image


        return response

    }

    static async doBattle(matrix1,matrix2,player1,player2){
        //console.log("***********",matrix1,matrix2,player1,player2)
        let battlefield = new BattleField(matrix1,matrix2);
        let rows = battlefield.getRows()
        let columns = battlefield.getColumns()
        let field=battlefield.getField()
        let winner;
        let storage = [];
        storage.push(...battlefield.getSnapShot());

        //console.log("Battlefield",JSON.stringify(battlefield));

        //check dead
        //target select : if not in range move if
        //damage calculation
        //repeat until there are no more soldiers of an address
        // if both dead coinflip
        while(battlefield.getEnemies(player1)!= 0 && battlefield.getEnemies(player2) != 0){
            //ciclo per target, attack e move
            for(let i=0;i<rows;i++){
                for(let j=0;j<columns;j++){
                    if(field[i][j] == null) continue
                    let card = field[i][j];
                    let nearest = battlefield.getNearestEnemy(card)
                    if(nearest == null) {
                        winner = card.getPlayerAddress()
                        break
                    }
                    let nearCoord = nearest.getPosition()
                    if(card.checkInRange(nearCoord.x,nearCoord.y)){
                        //attack
                        card.setTarget(nearest.getIndex(),nearCoord.x,nearCoord.y)
                        nearest.addDamageReceived(card.getAttack());
                    }else{
                        //move returns an array with : newx,newy,weight,distancefromtarget
                        //battlefield.printField()
                        let newCoord = this.moveCard(card,battlefield,nearCoord.x,nearCoord.y);
                        //console.log("moveBFS result:",newCoord);
                        if(newCoord == 0) continue; //the card didnt move because it could not move
                        if(newCoord[2]>card.getSpeed()) continue; //check if the card can really move
                        //if(newCoord[3]>card.getRange()) continue; // check if the card is in range
                        let newX = newCoord[0];
                        let newY = newCoord[1];
                        //let move=battlefield.moveCardTo(card,newX,newY);
                        
                        card.moveTo(newX,newY);
                        card.setTarget(nearest.getIndex(),nearCoord.x,nearCoord.y)
                        nearest.addDamageReceived(card.getAttack());
                        //update the battlefield
                        battlefield.moveCardTo(card,newX,newY);
                        //field[newX][newY]=card
                        //field[i][j]=null
                        //battlefield.setField(field)
                        field = battlefield.getField()
                        

                       // console.log("Card moved to a new position",card)
                    }
                }
            }
            battlefield.setField(field)
            field = battlefield.getField()
            storage.push(...battlefield.getSnapShot());
            //console.log(`!!!!!!!!!!!!!!!!! field is ${JSON.stringify(field)}`)
            //ciclo per il calcolo dei danni , reset target e damage ,deadCheck
            for(let i=0;i<rows;i++){
                for(let j=0;j<columns;j++){
                    if(field[i][j] == null) continue
                    let card = field[i][j];
                    card.calculateDamageReceived()
                    card.resetDamageReceived()
                    card.resetTarget()
                    if(card.checkDead() == true){
                        field[i][j]=null
                        //console.log("########Id card dead:",card.getIndex())
                    }  
                    
                }
            }
            battlefield.setField(field)
            field= battlefield.getField()
            storage.push(...battlefield.getSnapShot())
        }

        if(battlefield.getEnemies(player1)== 0) winner = player1
        //console.log("enemies1",battlefield.getEnemies(player1));

        if(battlefield.getEnemies(player2)== 0) winner = player2
        //console.log("enemies2",battlefield.getEnemies(player2));
        
        console.log("The winner issssssss ",winner)
        let response = {winner:winner,storage:storage}
        return response

    }

    static async getAffixInfo(affixIds){
        let response = {}
        let fullInfo
        try {
            fullInfo = await BattleQueries.getAffixes(affixIds[0],affixIds[1],affixIds[2])
        } catch (error) {
            logger.error(`Error in BattleQueries.getTurnsInfo: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if(fullInfo.length != 3) throw ("Error retrieving affixes")

        response.affixes = fullInfo
        return response
    }

    static async getAffixes(){
        let response = {}
        let fullInfo
        try {
            fullInfo = await BattleQueries.getAllAffixes()
        } catch (error) {
            logger.error(`Error in BattleQueries.getAllAffixes: ${Utils.printErrorLog(error)}`);
            throw error
        }

        response.affixes = fullInfo
        return response
    }

    static moveCard(card,battlefield,nearX,nearY){
        //console.log("moving card",card.getIdCardInstance())
        let directions =[  
        [-1, 0], //up
        [0, 1], //right
        [1, 0], //down
        [0, -1], //left
        ]
        let rows =battlefield.getRows()
        let columns = battlefield.getColumns()
        let field=battlefield.getField()

        let x = nearX
        let y= nearY
        // only return one final position that fits requirements
        let values = [];
        let final;
        let cardPos = card.getPosition()
        let range = card.getRange()
        let speed = card.getSpeed()
        // BFS uses queue to process data, Initially store first element

        let queue = [[cardPos.x, cardPos.y,0,Math.sqrt(((cardPos.x-x)**2)+((cardPos.y-y)**2))]]; //x,y,peso,distanza
        
        // created 2-d matrix same as given matrix with falsy values
        let seen = new Array(rows).fill('').map(() => new Array(columns).fill(false));
        
        while (queue.length) {
            //console.log("Queue is ",queue)
            //i dati saranno del tipo array
            //primo elemento x , secondo y , terzo peso del movimento
            //quarto distanza dal target
            let currentPos = queue.shift();
            let row = currentPos[0];
            let col = currentPos[1];
            let weight = currentPos[2];
            let dist =  currentPos[3];
            //console.log("Move INfos: ",row,col,weight,dist)

        
            // row should not be less then 0
            // row should not be greater then matrix.length
            // col should not be less then 0
            // col should not be greater then matrix.length
            // element should not be visited (seen[row][col])
        
            let invalidRow = row < 0 || row >= rows;
            let invalidCol = col < 0 || col >= columns;
            if (invalidRow || invalidCol || seen[row][col] || weight>speed) { //controllo peso maggiore speed
            continue; // continue while loop
            }


            if(field[row][col]==null && dist<=range && weight<=speed){
                final = [row,col,weight,dist];
                break;
                //ritorna e break
            }
        
            seen[row][col] = true; // marked true so that not to visit this again
            
            values.push([row,col,weight,dist]); // push visited element into values array
        
            // Push adjacent item in to queue
            
            for (let dir of directions) {
                if(row+dir[0]<0 || row+dir[0]>=rows || col+dir[1]<0 || col+dir[1]>=columns) continue
                if(field[(row + dir[0])][(col + dir[1])] == null){//se è occupato da un altro oggetto non puo essere visitata
                    let distance = Math.sqrt((((row+dir[0])-x)**2)+(((col+dir[1])-y)**2));
                    //console.log("new distance for the direction",row,col,dir,distance)
                    queue.push([row + dir[0], col + dir[1],weight+1,distance]);
                }
            }
        }
        if(final!=undefined || final!=null) return final
        else{
            if(values.length == 0) return 0;
            //console.log("Final Values",values)
            let minDist = 100
            let favPos
            for(let pos of values){
                //console.log("pos",pos)
                //console.log("speed",speed)
                if(pos[3]<minDist && pos[2]<=speed && field[pos[0]][pos[1]] == null){
                    minDist = pos[3]
                    favPos = pos
                }
            }
            if(!favPos) return 0
            return favPos
        }
    }
    

    

}

module.exports = {BattleService}