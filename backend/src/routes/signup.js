const signupRouter = require("express").Router();
const usersController = require("../controllers/usersController");
const { getNewTokens } = require("../controllers/authController");
const accessTokenData = require("../controllers/common");

signupRouter.post("/", usersController.create, getNewTokens, (req, res) => {
  return res
    .status(201)
    .json({ success: true, data: accessTokenData(res.locals.user) });
});

module.exports = signupRouter;
