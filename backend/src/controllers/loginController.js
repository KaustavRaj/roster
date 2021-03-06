const bcrypt = require("bcrypt");
const { Users } = require("../models");
const usersController = require("./usersController");

function verifyUserDetails(req, res, next) {
  const { email, password } = req.body;

  // check if email & password is sent
  if (!email || !password) {
    return res
      .status(401)
      .json({ success: false, error: "Didn't give correct params" });
  }

  // check if user details are correct in database
  Users.findOne({ email }, (err, foundUser) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    } else if (!foundUser) {
      return res
        .status(401)
        .json({ success: false, error: "No such user exists" });
    } else {
      bcrypt
        .compare(password, foundUser.password)
        .then((hasMatched) => {
          if (hasMatched) {
            res.locals.user = foundUser;
            next();
          } else {
            return res
              .status(401)
              .json({ success: false, error: "Authentication failed" });
          }
        })
        .catch((err) => {
          return res.status(500).json({ success: false, error: err });
        });
    }
  });
}

function sendUserProfileInfo(req, res, next) {
  req.query = { id: res.locals.user_id || res.locals.decodedTokenData.id };
  usersController.getById(req, res, next);
}

module.exports = { verifyUserDetails, sendUserProfileInfo };
