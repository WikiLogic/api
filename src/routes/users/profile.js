module.exports = function profile(req, res) {
  res.json({
    data: {
      user: {
        username: req.user.username,
        email: req.user.email,
        signUpDate: req.user.signUpDate
      }
    }
  });
};
