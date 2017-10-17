
module.exports = function profile(req, res){
    res.set(200);
    res.json({
        data: {
            user: {
                username: req.user.username,
                email: req.user.email,
                signUpDate: req.user.signUpDate
            }
        }
    });
}