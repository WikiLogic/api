// Testing the API
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');

describe('/test', function() {
  it('Should return ', function(done) {
    api.get('/test')
    .set('Accept', 'application/json')
    .expect(200, done);
  });
});

describe('Authentication & setting up test user for the other tests', function() {
  let JWT = '';

  // log in with no username - returns credential error
  it('Login request with empty username & password should return 400 Bad Request error', function(done) {
    api.post('/login')
    .send({ username: '', password: '' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400, done);
  });

  //test user doesn't exist yet
  it('Login for a username that doesn\'t exist yet should return 400 Bad client request', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  // sign up test user, no password - sign up fail, need password
  it('Signup request with empty email & password should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: '', password: '' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  // sign up test user, with password - signs you up! Return user object & token
  it('Signup request should return 200 and the relevant data', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {

      assert(response.body.data.user.username == 'test', 'The new user should have the username we signed up with');
      var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
      assert(response.body.data.user.signUpDate == datetime, 'The new user\'s sign up date should be today');

      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });


  it('After sign up it should allow you to get your user info', function(done) {
    api.get('/user')
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then(response => {
      assert(response.body.data.user.username, 'test');
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // log out without passing the jwt - shoul not have logged out the user

  // log out with the jwt - should log you out

  // sign up with test username - sign up error, username already exists (possibly do this with controversial words...?)
  it('Signup request with an existing username should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });
  
  // sign up with test email - sign up error, email already exists
  it('Signup request with an existing email should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test2', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  // retrieve password... ??? test needs to recieve email somehow

  // delete test user - 401 unauthorized (we're not logged in)
  it('Delete user without authentication, should return 401 Unauthorized', function(done) {
    api.del('/user')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(401, done);
  });

  // test user login, correct username, wrong password - credential error
  it('Login request with wrong password should return 401 Unauthorized', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'wrong' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400, done);
  });

  // test user login correct username, correct password - logged in!
  it('Login request should return 200 and the relevant data', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      assert(response.body.data.user.username, 'test');
      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // test user login again... ???

  // delete test user - logs you out
  it('Delete user with authentication should return 200 and log you out', function(done) {
    api.del('/user')
    .set('Authorization', JWT)
    .set('Accept', 'application/json')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .expect(200, done);
  });


  //------------------Finally, leave the test user in for the rest of the tests to use - we'll have to clear him out at the end
  it('Signup request should return 200 and the relevant data', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {

      assert(response.body.data.user.username == 'test', 'The new user should have the username we signed up with');
      var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
      assert(response.body.data.user.signUpDate == datetime, 'The new user\'s sign up date should be today');

      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
});