var Users = require("../../controllers/users/_index.js");
var bcrypt = require("bcryptjs");
var jwtService = require("../../authentication/jwtService.js");
var validator = require("validator");

module.exports = async function login(req, res) {
  let errors = [];

  if (!req.body.hasOwnProperty("username") || req.body.username == "") {
    errors.push({ title: "Username is required" });
  }

  if (!req.body.hasOwnProperty("password") || req.body.password == "") {
    errors.push({ title: "Password is required" });
  }

  if (errors.length > 0) {
    res.json({ errors: errors });
    return;
  }

  var username = validator.escape(req.body.username);
  var password = req.body.password;
  var usersData = await Users.getUserByUsername(username);

  if (usersData.length == 0) {
    res.json({
      errors: [
        {
          title: "No user found",
          detail: "There are no users in the database with that username."
        }
      ]
    });
    return;
  }

  let user = usersData[0];

  if (bcrypt.compareSync(req.body.password, user.hash)) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = { id: user._key };
    var token = jwtService.jwtSign(payload, jwtService.jwtOptions.secretOrKey);

    res.json({
      data: {
        token: token,
        user: {
          username: user.username,
          email: user.email,
          signUpDate: user.signUpDate
        }
      }
    });
  } else {
    res.status(200).json({ errors: [{ title: "Passwords did not match" }] });
  }
};
