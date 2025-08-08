const logger = require('../../logging/logger');

class MinerInterface{
    constructor() {}

    static async getMinerBuildResponse(caves, axes){
        return {
            caves: caves,
            axes: axes
        }
    }
}

module.exports = {MinerInterface}