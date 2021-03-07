const jwt = require("jsonwebtoken");
const config = require("../config");
const accessTokenData = require("./common");

/**
 *
 * @param {*} req request
 * @param {*} res response
 * @param {*} next callback
 * @summary verifies the access token provided
 * @returns 401/403 header if failed, otherwise the user data
 */
function verifyAccessToken(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;

  if (accessToken == null) {
    // no access token found
    if (refreshToken == null) {
      // redirect to login manually
      return res.status(401).json({ error: "no valid token found" });
    } else {
      // generate access token via refresh token
      renewAccessToken(req, res, next);
    }
  } else {
    // otherwise verify token
    jwt.verify(
      accessToken,
      config.token.access_secret,
      (err, decodedTokenData) => {
        if (err) {
          // unauthorized access, reject request
          return res.status(403).json({ error: "unauthorized access denied" });
        } else {
          // user authorization successful, send the user info
          res.locals.decodedTokenData = decodedTokenData;
          next();
        }
      }
    );
  }
}

function renewAccessToken(req, res, next) {
  const { refreshToken } = req.cookies;

  if (refreshToken == null) {
    // no refresh token provided, reject request
    return res
      .status(401)
      .json({ success: false, error: "no refresh token found" });
  }

  jwt.verify(refreshToken, config.token.refresh_secret, (err, user) => {
    if (err) {
      // invalid refresh token provided, reject it
      return res
        .status(401)
        .json({ success: false, error: "invalid refresh token" });
    } else {
      // refresh token verified successfully, send a
      // new access token containing only the info
      // required (eg. remove "expiredIn" etc.)
      const dataToEncrypt = accessTokenData(user);
      const newAccessToken = jwt.sign(
        dataToEncrypt,
        config.token.access_secret,
        {
          expiresIn: config.token.expiry_in,
        }
      );
      // send new access token here
      res.status(202).cookie("accessToken", newAccessToken);
      next();
    }
  });
}

function getNewTokens(req, res, next) {
  const { user } = res.locals;
  // const dataToEncrypt = accessTokenData(user);
  const dataToEncrypt = { id: user._id };
  const accessToken = jwt.sign(dataToEncrypt, config.token.access_secret, {
    expiresIn: config.token.expiry_in,
  });
  const refreshToken = jwt.sign(dataToEncrypt, config.token.refresh_secret);

  res.locals.user_id = dataToEncrypt.id;
  res.cookie("accessToken", accessToken).cookie("refreshToken", refreshToken);
  next();
}

module.exports = {
  verifyAccessToken,
  getNewTokens,
};
