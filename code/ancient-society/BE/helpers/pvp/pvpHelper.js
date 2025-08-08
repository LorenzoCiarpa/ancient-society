const logger = require('../../logging/logger');

class PvpHelper{
    static exp_func(alpha, beta, x) {
        let result = alpha * (Math.exp(beta * x))
        console.log('[INPUT] exp_func: ', alpha, beta, x)
        console.log('[OUTPUT] exp_func: ', result)
        return result
    }
}

module.exports = { PvpHelper }