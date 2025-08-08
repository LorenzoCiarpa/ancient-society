const {createPool} = require('mysql');
let mysql;
//database beta
// const mysql = createPool({
//      host: "us-cdbr-east-05.cleardb.net",
    // user: "bca104ec012d28",
    // password: "13a407e3",
    // database: "heroku_bc005772be6ba7f",
    // connectionLimit: 10,
    // timezone: "+00:00"
// });

//database beta

mysql = createPool({
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE,
    connectionLimit: process.env.CONNECTION_LIMIT,
    timezone: "+00:00",
    multipleStatements: true
});




module.exports = mysql;
