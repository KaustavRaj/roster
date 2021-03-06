const loginRouter = require("express").Router();
const {
  verifyAccessToken,
  getNewTokens,
} = require("../controllers/authController");
const {
  verifyUserDetails,
  sendUserProfileInfo,
} = require("../controllers/loginController");

/**
 * @todo
 * 1) make token.js logic here itself
 * 2) check how to handle auth whenever user opens url later on
 */

/**
 * @flow
 *
 * login -> verify user data -> generate access & refresh token -> return them after updating database
 * if verification failed -> return back to login
 *
 * if on some other path -> verify access token -> if expired/invalid then return failed status
 * afterwards client needs to send POST request to /token with it's refreshToken
 * if refreshToken is itself expired, then send failed status and let client clear it's database
 * and redirect to /login
 *
 */

// if token is given, verify that token, if not or if verification failed
// send html webpage; if verified successfully, redirect to "next" url param
loginRouter.get("/", verifyAccessToken, sendUserProfileInfo);
loginRouter.post("/", verifyUserDetails, getNewTokens, sendUserProfileInfo);

module.exports = loginRouter;
