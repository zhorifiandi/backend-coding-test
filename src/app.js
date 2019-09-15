const express = require("express");

const app = express();
const bodyParser = require("body-parser");
const ridesController = require("./controller/rides");

const jsonParser = bodyParser.json();

module.exports = (db) => {
  app.get("/health", (req, res) => res.send("Healthy"));

  app.get("/rides", (req, res) => ridesController.GetRides(db, req, res));

  app.get("/rides/:id", (req, res) => ridesController.GetRideById(db, req, res));

  app.post("/rides", jsonParser, (req, res) => ridesController.InsertRide(db, req, res));

  return app;
};
