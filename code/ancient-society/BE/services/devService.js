const logger = require('../logging/logger')
const random = require('random');

const { DevQueries } = require('../queries/devQueries')

class DevService{
    static buildAddressesArray(addresses){
        let response = [];
        for(let elem of addresses){
            if(elem.quantity!=0){
                for(let i=0;i<elem.quantity;i++){
                    response.push(elem.address)
                }
            }else { continue }
        }
        return response
    }

    static getWinners(pool,number){
        let response = []
        for(let i=0;i<number;i++){
            let x = random.int(0 , pool.length - 1);
            let addressToRemove = pool[x];
            response.push(addressToRemove);
            pool = pool.filter(x => x != addressToRemove);
        }
        return response
    }
}

module.exports= { DevService }