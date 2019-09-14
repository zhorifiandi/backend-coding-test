const sqlite3 = require("sqlite3").verbose();
const buildSchemas = require("./src/schemas");
const app = require("./src/app");

const db = new sqlite3.Database(":memory:");
const port = 8010;

db.serialize(() => {
  buildSchemas(db);

  app(db).listen(port, () => console.log(`App started and listening on port ${port}`));
});
