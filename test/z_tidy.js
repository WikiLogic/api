// Testing the API
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');

describe('Removing test user', function() {
  let JWT = '';
  //log in and delete the test user
  it('The log in credentials you set in api-credentials.json should log us in (the account should already exist)', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    })
  });

  it('Delete user with authentication should return 200 and log you out', function(done) {
    api.del('/user')
    .set('Authorization', JWT)
    .set('Accept', 'application/json')
    .send({ username: 'test', email: 'test@test.com', password: 'test' })
    .expect(200, done);
  });
});