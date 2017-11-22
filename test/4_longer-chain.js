// Testing the Claims route
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');

describe('Testing a slightly longer chain', function() {
  let JWT = '';
  let testData = {
    claim1: {
      text: 'CHAIN_TEST claim 1',
      probability: '50'
    },
    claim2: {
      text: 'CHAIN_TEST claim2',
      probability: '75'
    },
    claim3: {
      text: 'CHAIN_TEST claim3',
      probability: '25'
    }
  }
  let apiData = {};

  
  //be sure to be logged in
  it('Log in with the test user', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    })
  });

  // create the claims!
  it('Create Claim1', function(done) {
    api.post('/claims').send({ text: testData.claim1.text, probability: testData.claim1.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      apiData.claim1 = response.body.data.claim;
      done();
    })
  });
  it('Create Claim2', function(done) {
    api.post('/claims').send({ text: testData.claim2.text, probability: testData.claim2.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      apiData.claim2 = response.body.data.claim;
      done();
    })
  });
  it('Create Claim3', function(done) {
    api.post('/claims').send({ text: testData.claim3.text, probability: testData.claim3.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      apiData.claim3 = response.body.data.claim;
      done();
    })
  });

  //create the arguments!
  it('Create Argument1', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: apiData.claim1._id,
      type: 'FOR',
      premiseIds: [apiData.claim2._id]
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      //Responce should be an updated claim 1
      assert(apiData.claim1._id == response.body.data.claim._id, 'The returned claim should be an updated claim 1');
      assert(response.body.data.claim.arguments.length == 1, 'the updated claim 1 should now have one argument')
      apiData.claim1 = response.body.data.claim;
      done();
    })
  });
  it('Create Argument2', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: apiData.claim2._id,
      type: 'FOR',
      premiseIds: [apiData.claim3._id]
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      //Responce should be an updated claim 2
      assert(apiData.claim2._id == response.body.data.claim._id, 'The returned claim should be an updated claim 1');
      assert(response.body.data.claim.arguments.length == 1, 'the updated claim 2 should now have one argument'); //+ JSON.stringify(response.body.data.claim, null, 2)
      apiData.claim2 = response.body.data.claim;
      done();
    })
  });

  //Get claims to see that the arguments will come back for future people!
  it('Getting claim1 should return claim1 with the 1 argument we added', function(done) {
    api.get(`/claims/${apiData.claim1._key}`)
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id == apiData.claim1._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key == apiData.claim1._key, 'returned claim should have a _key');
      assert(response.body.data.claim.arguments.length == 1, 'Getting Claim 1 should now return with 1 argument');
      done();
    })
  });
  it('Getting claim2 should return claim2 with the 1 argument we added', function(done) {
    api.get(`/claims/${apiData.claim2._key}`)
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id == apiData.claim2._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key == apiData.claim2._key, 'returned claim should have a _key');
      assert(response.body.data.claim.arguments.length == 1, 'Getting Claim 2 should now return with 1 argument');
      done();
    })
  });

  //now to delete the arguments
  it('Delete argument1', function(done) {
    api.del('/arguments').send({ _id: apiData.claim1.arguments[0]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete argument2', function(done) {
    api.del('/arguments').send({ _id: apiData.claim2.arguments[0]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

  //and finally the claims
  it('Delete claim1', function(done) {
    api.del('/claims').send({ _id: apiData.claim1._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete claim2', function(done) {
    api.del('/claims').send({ _id: apiData.claim2._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete claim3', function(done) {
    api.del('/claims').send({ _id: apiData.claim3._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

  //TODO: deleting claims before arguments should remove any empty arguments from the db

});
