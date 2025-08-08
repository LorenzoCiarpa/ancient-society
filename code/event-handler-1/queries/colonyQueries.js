const  mysql  = require('../config/databaseConfig')

class ColonyQueries {

    static async addColony(address) {
        console.log('addColony query start')

        return new Promise((resolve, reject) => {
            let sql = `
            START TRANSACTION;
                SET @colony_index = (SELECT IF (MAX(colonyIndex), MAX(colonyIndex), 0) + 1 AS maxColonyIndex FROM colony WHERE mainCity = ?
                );

                INSERT INTO utente
                    (address, ancien, wood, stone)
                VALUES
                    (CONCAT(CONCAT(?, '_'), @colony_index), 0, 0, 0);

                INSERT INTO profile
                    (address, cityName)    
                VALUES
                    (CONCAT(CONCAT(?, '_'), @colony_index), CONCAT('#', @colony_index));
                
                INSERT INTO colony
                    (mainCity, colonyCity, colonyIndex)
                VALUES
                    (?, CONCAT(CONCAT(?, '_'), @colony_index), @colony_index);
                
                SELECT idColony, mainCity, colonyCity, colonyIndex 
                FROM colony
                WHERE mainCity = ? 
                AND colonyIndex = @colony_index;

                COMMIT;
        
                `

            mysql.query(sql, [address, address, address, address, address, address], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('addColony query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async checkIfColonyLimited(address) {
        console.log('checkIfColonyLimited query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    count(*) as counter
                FROM
                    colony 
                WHERE
                    mainCity = ? 
                `

            mysql.query(sql, [address], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('checkIfColonyLimited query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async checkIfUserExists(address) {
        console.log('checkIfUserExists query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    address 
                FROM
                    utente 
                WHERE
                    address = ?
                `

            mysql.query(sql, [address], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('checkIfUserExists query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getColonies(address) {
        console.log('getColonies query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c.*,
                    IF(p.id IS NULL OR p.cityName IS NULL, c.colonyCity , p.cityName) AS disColony
                FROM
                    colony AS c
                    LEFT JOIN
                        profile AS p 
                        ON p.address = c.colonyCity 
                WHERE
                    c.mainCity = ?
                ORDER BY
                    colonyIndex ASC
                `

            mysql.query(sql, [address], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('getColonies query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getColonyByIdColonyAndAddress(idColony, address) {
        console.log('getColonyByIdColonyAndAddress query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM
                    colony AS c
                WHERE
                    c.idColony = ?
                AND
                    c.mainCity = ?
                `

            mysql.query(sql, [idColony, address], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('getColonyByIdColonyAndAddress query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getCityGivenAddressAndIndex(address, index) {
        console.log('getCityGivenAddressAndIndex query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM
                    colony AS c
                WHERE
                    c.mainCity = ?
                AND
                    c.colonyIndex = ?
                `

            mysql.query(sql, [address, idColony], (err, rows) => {
                if (err) {
                    return reject(new Error(err.message))
                }
                if (rows == undefined || rows == null) {
                    console.log(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    console.log('getCityGivenAddressAndIndex query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }
}

module.exports = { ColonyQueries }