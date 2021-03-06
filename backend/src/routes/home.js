const homeRouter = require("express").Router();

homeRouter.get("/", (req, res) => {
  res.send("GET /");
});

// homeRouter.get("/:board_id/dashboard", (req, res) => {
//   res.redirect("/dashboard");
// });

module.exports = homeRouter;
