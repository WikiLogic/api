/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var path       = require('path');
var bodyParser = require('body-parser');
var port       = process.env.PORT || 3030;

//db connections: n n

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//================================= Routes
var apiRouter = express.Router();

apiRouter.get('/', function(req, res){
    res.json({message: 'Hello!'});
});



app.use('/', apiRouter);



//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);