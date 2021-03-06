const bcrypt = require("bcrypt");
const { Users } = require("../models");
const config = require("../config");

async function registerNewUser(req, res, next) {
  const { name, email, password } = req.body;
  // check if fullname & email & password is sent
  if (!email || !password || !name) {
    res
      .status(401)
      .json({ success: false, error: "Didn't give correct params" });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, config.bcrypt.salt_rounds);
  const newUser = {
    email: email,
    password: hashedPassword,
    name: name,
  };

  // create user
  await Users.create(newUser, (error, createdUser) => {
    if (!error) {
      // created successfully, now return token
      res.locals.user = createdUser;
      next();
    } else {
      // error occured
      res.status(500).json({ success: false, error: error });
    }
  });
}

module.exports = registerNewUser;
