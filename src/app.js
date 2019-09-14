
const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

module.exports = (db) => {
  app.get("/health", (req, res) => res.send("Healthy"));

  app.post("/rides", jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    const startLatCheck = startLatitude < -90 || startLatitude > 90;
    const startLongCheck = startLongitude < -180 || startLongitude > 180;
    if (startLatCheck || startLongCheck) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
      });
    }

    const endLatCheck = endLatitude < -90 || endLatitude > 90;
    const endLongCheck = endLongitude < -180 || endLongitude > 180;
    if (endLatCheck || endLongCheck) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
      });
    }

    if (typeof riderName !== "string" || riderName.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    if (typeof driverName !== "string" || driverName.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    if (typeof driverVehicle !== "string" || driverVehicle.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    const values = [req.body.start_lat, req.body.start_long,
      req.body.end_lat, req.body.end_long, req.body.rider_name,
      req.body.driver_name, req.body.driver_vehicle];

    const insertQuery = "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const result = db.run(insertQuery, values, function handleInsertion(err) {
      if (err) {
        res.send({
          error_code: "SERVER_ERROR",
          message: "Unknown error",
        });
        return;
      }

      db.all("SELECT * FROM Rides WHERE rideID = ?", this.lastID, (errDB, rows) => {
        if (errDB) {
          return res.send({
            error_code: "SERVER_ERROR",
            message: "Unknown error",
          });
        }

        return res.send(rows);
      });
    });
    return result;
  });

  app.get("/rides", (req, res) => {
    db.all("SELECT * FROM Rides", (err, rows) => {
      if (err) {
        return res.send({
          error_code: "SERVER_ERROR",
          message: "Unknown error",
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: "RIDES_NOT_FOUND_ERROR",
          message: "Could not find any rides",
        });
      }

      return res.send(rows);
    });
  });

  app.get("/rides/:id", (req, res) => {
    const result = db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        return res.send({
          error_code: "SERVER_ERROR",
          message: "Unknown error",
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: "RIDES_NOT_FOUND_ERROR",
          message: "Could not find any rides",
        });
      }

      return res.send(rows);
    });

    return result;
  });

  return app;
};
