const { mysql, mysqlPvp } = require('../config/databaseConfig')
const { Utils } = require('../utils/utils')
const logger = require('../logging/logger')


async function selectFromDB(query, arr, loggerMsg = '') {
  return new Promise((resolve, reject) => {
    logger.info(`${loggerMsg} START`);
    
    mysqlPvp.query(query, arr, (err, rows) => {
      if (typeof arr !== 'object') {
        logger.error('Invalid array of queries');
        return reject(err);
      }

      if (err) {
        logger.error(`Query Error: ${Utils.printErrorLog(err)}`);
        return reject(err.sqlMessage);
      }

      if (!rows) {
        logger.error('Query error: No result');
        return reject({ message: 'undefined' });
      }

      logger.info(`${loggerMsg} END`);
      return resolve(JSON.parse(JSON.stringify(rows)));
    });
  });
}

async function selectFromDBAlpha(query, arr, loggerMsg = '') {
  return new Promise((resolve, reject) => {
    logger.info(`${loggerMsg} START`);
    
    mysql.query(query, arr, (err, rows) => {
      if (typeof arr !== 'object') {
        logger.error('Invalid array of queries');
        return reject(err);
      }

      if (err) {
        logger.error(`Query Error: ${Utils.printErrorLog(err)}`);
        return reject(err.sqlMessage);
      }

      if (!rows) {
        logger.error('Query error: No result');
        return reject({ message: 'undefined' });
      }

      logger.info(`${loggerMsg} END`);
      return resolve(JSON.parse(JSON.stringify(rows)));
    });
  });
}

module.exports = { selectFromDB, selectFromDBAlpha };