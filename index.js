const sqlite3 = require("sqlite3").verbose();
const winston = require("winston");
const buildSchemas = require("./src/schemas");
const app = require("./src/app");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
});

const db = new sqlite3.Database(":memory:");
const port = 8010;

db.serialize(() => {
  buildSchemas(db);

  app(db).listen(port, () => logger.info(`App started and listening on port ${port}`));
});
