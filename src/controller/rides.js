const rides = require("../model/rides");
const helper = require("./rides/helper");

// Handler for GET /rides
module.exports.GetRides = async function getRides(db, req, res) {
  // Get Params
  const limit = req.query.per_page || 5;
  const page = req.query.page || 1;
  // Offset Calculation
  const offset = limit * (page - 1);

  const result = await rides.GetRides(db, limit, offset);
  return res.send(result);
};

// Handler for GET /rides/:id
module.exports.GetRideById = async function getRides(db, req, res) {
  const result = await rides.GetRideById(db, req.params.id);
  return res.send(result);
};

// Handler for POST /rides
module.exports.InsertRide = async function insertRide(db, req, res) {
  const payloadInvalid = helper.ValidateInsertQuery(req);
  if (payloadInvalid != null) {
    return res.send(payloadInvalid);
  }
  const values = [req.body.start_lat, req.body.start_long,
    req.body.end_lat, req.body.end_long, req.body.rider_name,
    req.body.driver_name, req.body.driver_vehicle];

  const result = await rides.InsertRide(db, values);
  return res.send(result);
};
