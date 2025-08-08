const {mysql} = require('../config/databaseConfig');
const logger= require('../logging/logger');
const { Utils } = require("../utils/utils");
const { serverConfig } = require('../config/serverConfig');
const { MatrixHelper } = require('../helpers/matrixHelper');

class Card{
    //minimum before fight:
    //range 1 , hp 1, speed 0 , atk 0 
    constructor (idCardInstance,idCard,name,level,type,rarity,attack,hp,speed,range,x,y,playerAddress,image){
        this.idCardInstance = idCardInstance
        this.idCard = idCard
        this.name = name
        this.level = level
        this.type = type
        this.rarity = rarity
        this.attack = attack
        this.hp = hp
        this.speed = speed
        this.range = range
        this.x = x
        this.y = y
        this.damageReceived = 0
        this.target = null
        this.playerAddress=playerAddress
        this.index = null
        this.image=image;
    }
    //info methods
    getName(){
        return this.name
    }
    getRange(){
        return this.range
    }
    getSpeed(){
        return this.speed
    }
    getIdCard(){
        return this.idCard
    }
    getIdCardInstance(){
        return this.idCardInstance
    }
    getLevel(){
        return this.level
    }
    getType(){
        return this.type
    }
    getRarity(){
        return this.rarity
    }
    getPlayerAddress(){
        return this.playerAddress
    }
    setIndex(i){
        this.index=i
    }
    getIndex(){
        return this.index
    }


    //attribute methods
    getAttack(){
        return this.attack
    }

    setAttack(atk){
        this.attack=atk
    }
    addAttack(atk){
        this.attack+=atk
    }
    subAttack(atk){
        this.attack-=atk
        if(this.attack<0) this.attack=0
    }
    addHp(toAdd){
        this.hp+=toAdd
    }
    subHp(atk){
        this.hp-=atk
        if(this.hp<=1) this.hp=1
    }
    addSpeed(toAdd){
        this.speed+=toAdd
    }
    subSpeed(atk){
        this.speed-=atk
        if(this.speed<=0) this.speed=0
    }
    addRange(toAdd){
        this.range+=toAdd
    }
    subRange(atk){
        this.range-=atk
        if(this.range<=1) this.range=1
    }
    setHp(newHp){
        this.hp=newHp
    }
    buffAttack(percentage){
        let toAdd
        toAdd = (percentage/100)*this.attack
        this.addAttack(toAdd)
    }
    debuffAttack(percentage){
        let toAdd
        toAdd = (percentage/100)*this.attack
        this.subAttack(toAdd)
    }
    buffHp(percentage){
        let toAdd
        toAdd = (percentage/100)*this.hp
        this.addHp(toAdd)
    }
    debuffHp(percentage){
        let toAdd
        toAdd = (percentage/100)*this.hp
        this.subHp(toAdd)
    }
    buffSpeed(percentage){
        let toAdd
        toAdd = (percentage/100)*this.speed
        this.addSpeed(toAdd)
    }
    debuffSpeed(percentage){
        let toAdd
        toAdd = (percentage/100)*this.speed
        this.subSpeed(toAdd)
    }
    buffRange(percentage){
        let toAdd
        toAdd = (percentage/100)*this.speed
        this.addRange(toAdd)
    }
    debuffRange(percentage){
        let toAdd
        toAdd = (percentage/100)*this.speed
        this.subRange(toAdd)
    }

    //battle methods
    moveTo(x,y){
        this.x=x
        this.y=y
    }
    getDistanceFrom(x,y){
        let position = this.getPosition()
        let cardX =  position.x
        let cardY = position.y
        return Math.sqrt(((cardX-x)**2)+((cardY-y)**2))
    }
    getPosition(){
        return {x:this.x,y:this.y}
    }
    calculateDamageReceived (){
        this.hp -= this.damageReceived
    }
    checkDead(){
        if(this.hp<=0) return true
        return false
    }
    setTarget(index,x,y){
        this.target = {index:index,x:x,y:y}
    }
    resetTarget(){
        this.target = null
    }
    checkInRange(x,y){
        if(this.getDistanceFrom(x,y)<=this.range) return true
        return false
    }
    resetDamageReceived(){
        this.damageReceived = 0
    }
    addDamageReceived(x){
        this.damageReceived +=x
    }
}

class BattleField{
    //the constructor initializes the battlefield by 
    //making the matrix like they are facing one another so
    //and updates the soldier position according to the battlefield disposition
    constructor(matrix1,matrix2){
        this.fieldRows = matrix1.length * 2
        this.fieldColumns = matrix1[0].length
        this.field=[]
        MatrixHelper.rotate180(matrix1)

        //insert first matrix
        let index=0
        for(let i = 0;i<matrix1.length;i++){
            let cardRow = []
            for(let j=0;j<this.fieldColumns;j++){
                if(matrix1[i][j] != null) {
                    matrix1[i][j].setIndex(index)
                    index++;
                }
                cardRow.push(matrix1[i][j]);
            }
            this.field.push(cardRow)
        }
        //insert second matrix
        for(let l = 0;l<matrix2.length;l++){
            let cardRow = []
            for(let m=0;m<this.fieldColumns;m++){
                //console.log("elem",matrix2[l][m])
                if(matrix2[l][m] != null) {
                    matrix2[l][m].setIndex(index)
                    index++;
                }
                cardRow.push(matrix2[l][m]);  
            }
            this.field.push(cardRow)
        }
        //update every single card position
        for(let k = 0;k<this.fieldRows;k++){
            for(let h=0;h<this.fieldColumns;h++){
                if(this.field[k][h]== null) continue;
                this.field[k][h].moveTo(k,h);
            }
        }
    }

    getField(){
        return this.field
    }
    printField(){
        let newMatrix = []
        for(let i=0;i<this.fieldRows;i++){
            let row=[]
            for(let j=0;j<this.fieldColumns;j++){
                if(this.field[i][j]!=null)  row.push(this.field[i][j].getIdCardInstance())
                else row.push(null)
            }
            newMatrix.push(row)
        }
        console.log(newMatrix)
    }
    setField(newField){
        this.field=newField
    }

    getSnapShot(){
        let x = [JSON.parse(JSON.stringify(this.getField()))]
        return x
    }

    getRows(){
        return this.fieldRows
    }

    getColumns(){
        return this.fieldColumns
    }
    getCard(x,y){
        if(this.field[x][y] !=null)
        return this.field[x][y]
        else return null
    }
    getEnemies(player){
        //returns 0 if no enemy is found
        let enemies=[]
        for(let i=0;i<this.fieldRows;i++){
            for(let j=0;j<this.fieldColumns;j++){
                if(this.field[i][j]!=null && (this.field[i][j].getPlayerAddress() != player)){
                    enemies.push(this.field[i][j])
                }
            }
        }
        if(enemies.length != 0) return enemies
        return 0
    }

    //x,y are the coords to the card we want to get the nearest enemy to 
    moveCardTo(card,newX,newY){
        let cardPos = card.getPosition()
        let oldX=cardPos.x
        let oldY=cardPos.y
        if(this.field[newX][newY] != null) return 0
        if(this.field[oldX][oldY] == null) return 0
        this.field[newX][newY]=this.field[oldX][oldY]
        this.field[oldX][oldY] = null
        return 1
    }


    getNearestEnemy(card){
        //returns 0 if no near enemy is found
        let player = card.getPlayerAddress()
        let coord = card.getPosition()
        let enemies = this.getEnemies(player)
        if(enemies == 0) return 0
        let nearestPos
        let nearestDist=100
        for(let card of enemies){
            let dist=card.getDistanceFrom(coord.x,coord.y)
            if(dist<nearestDist){
                nearestDist=dist
                nearestPos = card.getPosition()
            }
        }
        return this.getCard(nearestPos.x,nearestPos.y)
    }


}
module.exports={Card,BattleField}