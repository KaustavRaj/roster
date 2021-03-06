const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

require("dotenv").config();

// get all routes
const routes = require("./routes");

// all config
const config = require("./config");

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// for POST requests
app.use(express.urlencoded({ extended: false }));

// using bodyParser to parse JSON bodies into JS objects
app.use(express.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("dev"));

app.use(cookieParser());

// react app
// app.use(express.static(path.join(__dirname, "../../client/build")));

// all endpoints
app.use("/", routes.home);
app.use("/signup", routes.signup);
app.use("/login", routes.login);
app.use("/logout", routes.logout);
app.use("/boards", routes.boards);
app.use("/users", routes.users);
app.use(
  "/:board_id/dashboard",
  (req, res, next) => {
    res.locals = { ...req.params };
    next();
  },
  routes.dashboard
);

// starting the server
app.listen(config.app.port, () => {
  console.log("listening on port", config.app.port);
});
