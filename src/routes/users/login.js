var Users = require('../../controllers/users/_index.js');
var bcrypt = require('bcryptjs');
var jwtService = require('../../authentication/jwtService.js');
var validator = require('validator');

module.exports = function login(req, res){
    
    let errors = [];

    if (!req.body.hasOwnProperty('username') || req.body.username == '') {
        errors.push({title:'Username is required'});
    } else if (!validator.isAlphanumeric(req.body.username + '')) {
        //TODO: make this accept anything - but sill clear it from attacks
        errors.push({title:'Username can only have alphanumeric characters'});
    }

    if (!req.body.hasOwnProperty('password') || req.body.password == '') {
        errors.push({title:'Password is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }
    
    var username = validator.escape(req.body.username);
    var password = req.body.password;

    Users.getUserByUsername(username).then((data) => {
        let user = data[0]; 
        if (data.length == 0) {
            res.status(400);
            res.json({ 
                errors: [
                    {
                        title: 'No user found',
                        detail: 'There are no users in the database with that username.'
                    }
                ]
            });
            return;
        }

        if(bcrypt.compareSync(req.body.password, user.hash)) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {id: user._key};
            var token = jwtService.jwtSign(payload, jwtService.jwtOptions.secretOrKey);
            res.status(200);
            res.json({ 
                data: {
                    token: token,
                    user: {
                        username: user.username,
                        signUpDate: user.signUpDate
                    }
                }
            });
        } else {
            res.status(400).json({errors: [{ title: 'Passwords did not match' }]});
        }

    }).catch((err) => {
        console.log("LOGIN Get User error: ", err);
        res.status(400).json({message:"err"});
    });
};
