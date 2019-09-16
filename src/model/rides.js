const SqlString = require("sqlstring");

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

module.exports.GetRides = async function getRides(db, limit, offset) {
  try {
    const getRidesQuery = SqlString.format("SELECT * FROM Rides LIMIT ? OFFSET ?", [limit, offset]);
    const rows = await db.allAsync(getRidesQuery);
    if (rows.length === 0) {
      return {
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      };
    }
    return rows;
  } catch (err) {
    return {
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    };
  }
};

module.exports.InsertRide = async function insertRide(db, values) {
  try {
    const insertQuery = SqlString.format("INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)", values);
    const insertedRow = await db.runAsync(insertQuery);
    const lastRide = await db.allAsync(SqlString.format("SELECT * FROM Rides WHERE rideID = ?", insertedRow.lastID));
    return lastRide;
  } catch (err) {
    return {
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    };
  }
};

module.exports.GetRideById = async function getRideById(db, id) {
  try {
    const findQuery = SqlString.format("SELECT * FROM Rides WHERE rideID=?", id);
    const rows = await db.allAsync(findQuery);
    if (rows.length === 0) {
      return {
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      };
    }
    return rows;
  } catch (err) {
    return {
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    };
  }
};
