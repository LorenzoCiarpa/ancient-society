//LIBRARIES
const {createPool} = require('mysql');

//CONFIG
const {serverConfig} = require('./web3Config')

//GLOBAL VARIABLES
let mysql;


mysql = createPool({
        host: serverConfig.database.HOST_DB,
        port: serverConfig.database.PORT_DB,
        user: serverConfig.database.USER_DB,
        password: serverConfig.database.PASSWORD_DB,
        database: serverConfig.database.DATABASE,
        connectionLimit: serverConfig.database.CONNECTION_LIMIT,
        timezone: "+00:00",
        multipleStatements: true
    });


module.exports = mysql;
