const logger = require("../util/logger");

module.exports.CreateTableRides = (db) => {
  const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

  db.run(createRideTableSchema);

  return db;
};


module.exports.GetRides = (db, limit, offset, res) => {
  const getRidesQuery = "SELECT * FROM Rides LIMIT ? OFFSET ?";
  db.all(getRidesQuery, [limit, offset], (err, rows) => {
    if (err) {
      logger.info(err);
      return res.send({
        error_code: "SERVER_ERROR",
        message: "Unknown error",
      });
    }

    if (rows.length === 0) {
      logger.info("RIDES_NOT_FOUND_ERROR");
      return res.send({
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      });
    }

    logger.info(rows);
    return res.send(rows);
  });

  return db;
};

module.exports.InsertRide = (db, res, values) => {
  const insertQuery = "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.run(insertQuery, values, function InsertHandle(err) {
    if (err) {
      logger.info(err);
      return res.send({
        error_code: "SERVER_ERROR",
        message: "Unknown error",
      });
    }

    db.all("SELECT * FROM Rides WHERE rideID = ?", this.lastID, (errDB, rows) => {
      if (errDB) {
        logger.info(err);
        return res.send({
          error_code: "SERVER_ERROR",
          message: "Unknown error",
        });
      }

      logger.info(rows);
      return res.send(rows);
    });
  });
  return db;
};

module.exports.GetRideById = (db, res, id) => {
  const findQuery = `SELECT * FROM Rides WHERE rideID='${id}'`;
  db.all(findQuery, (err, rows) => {
    if (err) {
      logger.info(err);
      return res.send({
        error_code: "SERVER_ERROR",
        message: "Unknown error",
      });
    }

    if (rows.length === 0) {
      logger.info("RIDES_NOT_FOUND_ERROR");
      return res.send({
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      });
    }

    logger.info(rows);
    return res.send(rows);
  });
  return db;
};
