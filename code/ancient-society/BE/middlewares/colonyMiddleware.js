const logger = require('../logging/logger');
const { ColonyQueries } = require('../queries/colonyQueries');

async function isColony(req, res, next) {
    let idColony = req.body.idColony;
    let address = req.locals.address;

    if (idColony == null || idColony == undefined) {
        next();
        return;
    }

    let colony
    try {
        colony = await ColonyQueries.getColonyByIdColonyAndAddress(idColony, address)
    } catch (error) {
        console.warn(error)
        return res
            .status(401)
            .json({
                success: false
            })
    }

    if (colony.length == 0 || !colony[0].isAllowed) {
        console.warn("colony: ", colony)

        return res
            .status(401)
            .json({
                success: false
            })
    }

    req.locals.address = colony[0].colonyCity;
    next();
    return;

}



module.exports = {
    isColony,
}