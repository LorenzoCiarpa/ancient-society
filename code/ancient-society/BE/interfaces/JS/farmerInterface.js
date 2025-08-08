const logger = require('../../logging/logger');

class FarmerInterface{
    constructor() {}

    static async getFarmerBuildResponse(fields, hoes){
        return {
            fields: fields,
            hoes: hoes
        }
    }
}

module.exports = {FarmerInterface}