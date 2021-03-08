const loginRouter = require("express").Router();
const {
  verifyAccessToken,
  getNewTokens,
} = require("../controllers/authController");
const {
  verifyUserDetails,
  sendUserProfileInfo,
} = require("../controllers/loginController");

loginRouter.get("/", verifyAccessToken, sendUserProfileInfo);
loginRouter.post("/", verifyUserDetails, getNewTokens, sendUserProfileInfo);

module.exports = loginRouter;
