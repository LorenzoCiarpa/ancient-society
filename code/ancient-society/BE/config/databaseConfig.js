const { createPool } = require('mysql');
const { serverConfig } = require('./serverConfig')

let mysql, mysqlPvp;



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


mysqlPvp = createPool({
  host: serverConfig.pvpdatabase.HOST_DB,
  port: serverConfig.pvpdatabase.PORT_DB,
  user: serverConfig.pvpdatabase.USER_DB,
  password: serverConfig.pvpdatabase.PASSWORD_DB,
  database: serverConfig.pvpdatabase.DATABASE,
  connectionLimit: serverConfig.pvpdatabase.CONNECTION_LIMIT,
  timezone: "+00:00",
  multipleStatements: true
});


module.exports = { mysql, mysqlPvp };
