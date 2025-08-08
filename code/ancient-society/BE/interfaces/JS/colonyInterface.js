const logger = require('../../logging/logger')

class ColonyInterface {
    constructor() { }

    static buildGetColonies(coloniesRows) {
        logger.debug('buildGetColonies interface start')

        let colonies
        colonies = coloniesRows.map((row) => ({
            idColony: row.idColony,
            mainCity: row.mainCity,
            colonyCity: row.colonyCity,
            colonyIndex: row.colonyIndex,
            isAllowed: row.isAllowed == 1 ? true : false,
            cityName: row.disColony
        })
        )

        logger.debug('buildGetColonies interface end')
        return colonies
    }

}

module.exports = { ColonyInterface }