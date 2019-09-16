const request = require("supertest");
const db = require("../src/db/sqlite");
const config = require("config");
const username = config.get("BasicAuth.username");
const password = config.get("BasicAuth.password");

const app = require("../src/app")(db);
const rides = require("../src/model/rides");

describe("API tests", () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      rides.CreateTableRides(db);

      done();
    });
  });

  describe("GET /health", () => {
    it("should return health", (done) => {
      request(app)
        .get("/health")
        .auth(username, password)
        .expect("Content-Type", /text/)
        .expect(200, done);
    });
  });

  describe("GET /rides no auth given", () => {
    it("should return not authorized error", (done) => {
      request(app)
        .get("/rides")
        .expect(401, done);
    });
  });

  describe("GET /rides no data", () => {
    it("should return not found error", (done) => {
      request(app)
        .get("/rides")
        .auth(username, password)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, {
          error_code: "RIDES_NOT_FOUND_ERROR",
          message: "Could not find any rides",
        }, done);
    });
  });

  describe("GET /rides/:id no data", () => {
    it("should return not found error", (done) => {
      request(app)
        .get("/rides/1")
        .auth(username, password)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, {
          error_code: "RIDES_NOT_FOUND_ERROR",
          message: "Could not find any rides",
        }, done);
    });
  });

  describe("GET /rides with data", () => {
    before((done) => {
      db.serialize((err) => {
        if (err) {
          return done(err);
        }

        const values = [0, 0, 0, 0, "Rider name", "Driver name", "Driver vehicle"];
        const insertQuery = "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(insertQuery, values, (err) => {});

        done();
      });
    });

    it("should return success", (done) => {
      request(app)
        .get("/rides")
        .auth(username, password)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            res.body[i].created = "";
          }
        })
        .expect(200, [{
          rideID: 1,
          startLat: 0,
          startLong: 0,
          endLat: 0,
          endLong: 0,
          riderName: "Rider name",
          driverName: "Driver name",
          driverVehicle: "Driver vehicle",
          created: "",
        }], done);
    });
  });

  describe("GET /rides with pagination params page=2&per_page=3", () => {
    before((done) => {
      db.serialize((err) => {
        if (err) {
          return done(err);
        }

        const values = [0, 0, 0, 0, "Rider name", "Driver name", "Driver vehicle"];
        const insertQuery = "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const numDummy = 9
        for (let i = 0; i < numDummy; i++) {
          db.run(insertQuery, values, (err) => {});
        }

        done();
      });
    });

    it("should return success and have 3 elements", (done) => {
      request(app)
        .get("/rides?page=2&per_page=3")
        .auth(username, password)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          if (res.body.length != 3) {
            throw new Error('Response body should have 3 elements');
          }
        })
        .expect(200, done);
    });
  });

  describe("GET /rides/:id with data", () => {
    it("should return success", (done) => {
      request(app)
        .get("/rides/1")
        .auth(username, password)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, [{
          rideID: "",
          startLat: 0,
          startLong: 0,
          endLat: 0,
          endLong: 0,
          riderName: "Rider name",
          driverName: "Driver name",
          driverVehicle: "Driver vehicle",
          created: "",
        }], done);
    });
  });

  describe("POST /rides valid payload", () => {
    it("should return success", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: 0,
          start_long: 0,
          end_lat: 0,
          end_long: 0,
          rider_name: "Rider name",
          driver_name: "Driver name",
          driver_vehicle: "Driver vehicle",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, [{
          rideID: "",
          startLat: 0,
          startLong: 0,
          endLat: 0,
          endLong: 0,
          riderName: "Rider name",
          driverName: "Driver name",
          driverVehicle: "Driver vehicle",
          created: "",
        }], done);
    });
  });

  describe("POST /rides invalid start location", () => {
    it("should return error response", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: -200,
          start_long: 200,
          end_lat: 0,
          end_long: 0,
          rider_name: "Rider name",
          driver_name: "Driver name",
          driver_vehicle: "Driver vehicle",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, {
          error_code: "VALIDATION_ERROR",
          message: "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
        }, done);
    });
  });

  describe("POST /rides invalid end location", () => {
    it("should return error response", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: 0,
          start_long: 0,
          end_lat: -200,
          end_long: 200,
          rider_name: "Rider name",
          driver_name: "Driver name",
          driver_vehicle: "Driver vehicle",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, {
          error_code: "VALIDATION_ERROR",
          message: "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
        }, done);
    });
  });

  describe("POST /rides invalid rider name", () => {
    it("should return error", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: 0,
          start_long: 0,
          end_lat: 0,
          end_long: 0,
          rider_name: "",
          driver_name: "Driver name",
          driver_vehicle: "Driver vehicle",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, {
          error_code: "VALIDATION_ERROR",
          message: "Rider name must be a non empty string",
        }, done);
    });
  });

  describe("POST /rides invalid driver name", () => {
    it("should return error", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: 0,
          start_long: 0,
          end_lat: 0,
          end_long: 0,
          rider_name: "Rider name",
          driver_name: "",
          driver_vehicle: "Driver vehicle",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, {
          error_code: "VALIDATION_ERROR",
          message: "Rider name must be a non empty string",
        }, done);
    });
  });

  describe("POST /rides invalid vehicle name", () => {
    it("should return error", (done) => {
      request(app)
        .post("/rides")
        .auth(username, password)
        .send({
          start_lat: 0,
          start_long: 0,
          end_lat: 0,
          end_long: 0,
          rider_name: "Rider Name",
          driver_name: "Driver name",
          driver_vehicle: "",
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect((res) => {
          for (let i = 0; i < res.body.length; i++) {
            // Omit dynamic params
            res.body[i].rideID = "";
            res.body[i].created = "";
          }
        })
        .expect(200, {
          error_code: "VALIDATION_ERROR",
          message: "Rider name must be a non empty string",
        }, done);
    });
  });
});
