require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const config = require("./config");
const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/signup", routes.signup);
app.use("/api/login", routes.login);
app.use("/api/logout", routes.logout);
app.use("/api/boards", routes.boards);
app.use("/api/users", routes.users);
app.use(
  "/api/:board_id/dashboard",
  (req, res, next) => {
    res.locals = { ...req.params };
    next();
  },
  routes.dashboard
);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(config.app.port, () => {
  console.log("listening on port", config.app.port);
});
