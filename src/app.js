const express = require("express");
const basicAuth = require("express-basic-auth");
const config = require("config");
const fs = require("fs");
const markdown = require( "markdown" ).markdown;

const userGranted = {};
userGranted[config.get("BasicAuth.username")] = config.get("BasicAuth.password");

const app = express();
// app.use(basicAuth({
//   users: userGranted,
// }));

const bodyParser = require("body-parser");
const ridesController = require("./controller/rides");

const jsonParser = bodyParser.json();

module.exports = (db) => {
  app.get("/health", (req, res) => res.send("Healthy"));
  app.get("/docs", (req, res) => {
    fs.readFile('./docs/Readme.md', 'utf8', (err, data) => {
        res.send(markdown.toHTML(data))
    });
  });
  app.get("/rides", (req, res) => ridesController.GetRides(db, req, res));
  app.get("/rides/:id", (req, res) => ridesController.GetRideById(db, req, res));
  app.post("/rides", jsonParser, (req, res) => ridesController.InsertRide(db, req, res));

  return app;
};
