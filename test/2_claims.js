// Testing the Claims route
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');

describe('Testing basic Claims', function() {
  let JWT = '';
  let srcTestClaim = { 
    text: 'Mocha test claim', 
    searchText: 'Mocha',
    probability: '55' 
  }
  let srcSimilarTestClaim = {
    text: 'Mocha', 
    probability: '55' 
  }
  let srcUndefinedProbabilityTestClaim = {
    text: 'Mocha undefined probability claim',
    probability: undefined
  }
  let testClaim = {};
  let similarTestClaim = {};
  

  //be sure to be logged in
  it('Log in with the test user', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    })
  });

  //Create a claim - if the claim already exists the existing one should just be returned but with an error in the errors array
  it('Posting claim data to /claims should return a claim', function(done) {
    api.post('/claims')
    .send({ text: srcTestClaim.text, probability: srcTestClaim.probability })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.claim.text == srcTestClaim.text, 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim._id, 'Returned new claim should have a ._id');
      assert.exists(response.body.data.claim._key, 'Returned new claim should have a ._key');
      testClaim = response.body.data.claim;
      
      done();
    })
  });

  //Create a claim with the same text - should return the existing claim
  it('Posting claim with duplicate text should return the existing claim but also an error object', function(done) {
    api.post('/claims')
    .send({ text: srcTestClaim.text, probability: srcTestClaim.probability })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {

      assert(response.body.data.claim.text == srcTestClaim.text, 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim._id, 'Returned new claim should have a ._id');
      assert.exists(response.body.data.claim._key, 'Returned new claim should have a ._key');
      testClaim = response.body.data.claim;

      assert(response.body.errors.length > 0, 'Trying to create a claim that already exists should prompt an error in the api response');
      done();
    });
  });

  //Create a claim with similar text to the one above - should return a new claim, not the one above
  it('Posting claim with similar text should return a new claim, not the existing one', function(done) {
    api.post('/claims')
    .send({ text: srcSimilarTestClaim.text, probability: srcSimilarTestClaim.probability })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {

      assert(response.body.data.claim.text == srcSimilarTestClaim.text, 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim._id, 'Returned new claim should have a ._id');
      assert.exists(response.body.data.claim._key, 'Returned new claim should have a ._key');
      similarTestClaim = response.body.data.claim;
      done();
    });
  });

  //Create a claim with similar text to the one above - should return a new claim, not the one above
  it('Posting claim with similar text should return a new claim, not the existing one', function(done) {
    api.post('/claims')
    .send({ text: srcSimilarTestClaim.text, probability: srcSimilarTestClaim.probability })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {

      assert(response.body.data.claim.text == srcSimilarTestClaim.text, 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim._id, 'Returned new claim should have a ._id');
      assert.exists(response.body.data.claim._key, 'Returned new claim should have a ._key');
      similarTestClaim = response.body.data.claim;
      done();
    });
  });

  //Create a claim with similar text to the one above - should return a new claim, not the one above
  it('Posting claim with undefined probability should return a new claim presuming 0.5 probability', function(done) {
    api.post('/claims')
    .send({ text: srcUndefinedProbabilityTestClaim.text, probability: undefined })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {

      assert(response.body.data.claim.text == srcUndefinedProbabilityTestClaim.text, 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim._id, 'Returned new claim should have a ._id');
      assert.exists(response.body.data.claim._key, 'Returned new claim should have a ._key');
      undefinedProbabilityTestClaim = response.body.data.claim;
      done();
    });
  });

  //get the claim we just created
  it('Getting the claim we just created by it\'s id Should return that claim', function(done) {
    api.get(`/claims/${testClaim._key}`)
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.claim.text == srcTestClaim.text, 'Returned claim should have the text we\'re expecting');
      assert(response.body.data.claim.probability == srcTestClaim.probability, 'Returned claim should still have the initial probability we set');
      assert(response.body.data.claim._id == testClaim._id, 'Returned claim should have the id we\'re expecting');
      
      done();
    })
  });

  //search for the claim we just created
  it('Full text search for the claim we just created should return the claim', function(done){
    api.get(`/claims/search?s=${srcTestClaim.text}`)
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.results.length > 0, 'The search should return at least one thing');
      
      done();
    })
  });

  //search for the claim we just created
  it('Partial text search for the claim we just created should return the claim', function(done){
    api.get(`/claims/search?s=${srcTestClaim.searchText}`)
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.results.length > 0, 'The search should return at least one thing');
      
      done();
    })
  });

  //Edit the claim we just created

  //Delete the claim we just created
  it('Delete the test claim', function(done) {
    api.del('/claims').send({ _id: testClaim._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

  it('Delete the similar test claim', function(done) {
    api.del('/claims').send({ _id: similarTestClaim._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
});
