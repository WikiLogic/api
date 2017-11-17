var Users = require('../../controllers/users/_index.js');
var bcrypt = require('bcryptjs');
var jwtService = require('../../authentication/jwtService.js');
var validator = require('validator');
var guestlist;
try {
    guestlist = require('../../guestlist.js');
} catch (err) {
    console.log('To log in you\'re going to need to whitelist yourself with a guestlist.js file');
    guestlist = require('../../guestlist-example.js');
}

module.exports = function signUp(req, res) {
    let errors = [];

    if (!req.body.hasOwnProperty('username') || req.body.username == '') {
        errors.push({title:'Username is required'});
    } else if (!validator.isAlphanumeric(req.body.username + '')) {
        errors.push({title:'Username can only have alphanumeric characters'});
    }

    if (!req.body.hasOwnProperty('email') || req.body.email == '') {
        errors.push({title:'Email is required'});
    } else if (!validator.isEmail(req.body.email)) {
        errors.push({title:'Valid email is required'});
    }

    if (!req.body.hasOwnProperty('password') || req.body.password == '') {
        errors.push({title:'Password is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    var email = validator.escape(req.body.email);
    var username = validator.escape(req.body.username);
    var password = req.body.password;
    
    //check if email is in whitelist
    let whitelisted = false;
    for (var p = 0; p < guestlist.people.length; p++){
        if (email == guestlist.people[p].email) {
            whitelisted = true;
        }
    }
    
    if (!whitelisted) {
        res.json({message: "We're not open to public sign ups yet,please contact us to sign up"});
        return;
    }

    //check if username has been taken
    Users.checkIfUnique({
        username:username, 
        email:email
    }).then((isUnique) => {
        
        if (!isUnique) {
            res.status(400);
            res.json({message: "Duplicate credentials"});
            return;
        }

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        
        Users.createUser(email, username, hash).then((newUser) => {
            var payload = {id: newUser.id};
            var token = jwtService.jwtSign(payload, jwtService.jwtOptions.secretOrKey);
            res.status(200);
            res.json({ 
                data: {
                    token: token,
                    user: {
                        username: newUser.username,
                        signUpDate: newUser.signUpDate
                    }
                }
            });

        }).catch((err) => {
            res.json({message:"sign up error " + err});
        });

    }).catch((err) => {
        res.status(400);
        res.json({message: "Duplicate credentials"});
    });
    
};