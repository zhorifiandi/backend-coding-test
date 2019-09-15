const sqlite3 = require("sqlite3").verbose();
const rides = require("./src/model/rides");
const app = require("./src/app");
const logger = require("./src/util/logger");


const db = new sqlite3.Database(":memory:");
const port = 8010;

db.serialize(() => {
  rides.CreateTableRides(db);

  app(db).listen(port, () => logger.info(`App started and listening on port ${port}`));
});
