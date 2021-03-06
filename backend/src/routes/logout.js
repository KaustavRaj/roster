const logoutRouter = require("express").Router();

logoutRouter.post("/", (req, res) => {
  return res
    .status(202)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ success: true });
});

module.exports = logoutRouter;
