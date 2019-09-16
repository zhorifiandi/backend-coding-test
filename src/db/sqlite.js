const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(":memory:");
const logger = require("../util/logger");

db.allAsync = function dbAll(sql) {
  const that = this;
  return new Promise(((resolve, reject) => {
    that.all(sql, (err, row) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.info(row);
        resolve(row);
      }
    });
  }));
};

db.runAsync = function dbRun(sql) {
  return new Promise((resolve, reject) => {
    this.run(sql, function executeRun(err) {
      if (err) {
        logger.error(err);
        reject(err);
      } else resolve(this);
    });
  });
};

module.exports = db;
