// Testing the Claims route
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');

// To test this we will need to create a top claim and two argument groups, each with 2 claims within them (for now, more in the future!)
// Top claim
//      against group 1
//          claim against 1
//          claim against 2
//      for group 1
//          claim for 1
//          claim for 2


describe('Testing basic Arguments', function() {
  let JWT = '';
  let srcArgTestClaims = {
    top: {
      text: 'ARG_TEST top claim',
      probability: '50'
    },
    against1: {
      text: 'ARG_TEST claim against 1',
      probability: '75'
    },
    against2: {
      text: 'ARG_TEST claim against 2',
      probability: '75'
    },
    for1: {
      text: 'ARG_TEST claim for 1',
      probability: '25'
    },
    for2: {
      text: 'ARG_TEST claim for 2',
      probability: '25'
    }
  }
  let argTestClaims = {};

  
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

  // create the claim off which we're going to start doing argument testing
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: srcArgTestClaims.top.text, probability: srcArgTestClaims.top.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.top = response.body.data.claim;
      done();
    })
  });

  // create  claim off which we're going to start doing argument testing
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: srcArgTestClaims.against1.text, probability: srcArgTestClaims.against1.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.against1 = response.body.data.claim;
      done();
    })
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: srcArgTestClaims.against2.text, probability: srcArgTestClaims.against2.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.against2 = response.body.data.claim;
      done();
    })
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: srcArgTestClaims.for1.text, probability: srcArgTestClaims.for1.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.for1 = response.body.data.claim;
      done();
    })
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: srcArgTestClaims.for2.text, probability: srcArgTestClaims.for2.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.for2 = response.body.data.claim;
      done();
    })
  });

  // =========================================================== 
  // =========================================================== 
  // Starting the actual argument testing way down here!!!!!!!!!
  // =========================================================== 
  // =========================================================== 

  //invent a new argument and add it to that claim
  it('new FOR argument to the top test claim, should return updated top test claim', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: argTestClaims.top._id, //pass the id of the first 'top' claim we created above
      type: 'FOR',
      premiseIds: [argTestClaims.for1._id, argTestClaims.for2._id] //give the ids of the two 'for' claims we created above
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      let hasForGroup = 0;
      let returnedArgs = response.body.data.claim.arguments;
      argTestClaims.forArg = response.body.data.claim.arguments;
      
      assert(response.body.data.claim._id == argTestClaims.top._id, 'The parent claim should be the one returned');
      assert(returnedArgs.length == 1, 'The claim should now have 1 argument');
      assert(response.body.data.claim.probability, 'The claim should have a probability');
      assert(returnedArgs[0].type == 'FOR', 'The returned argument in the parent claim should be FOR');

      for (var a = 0; a < returnedArgs.length; a++) {
        returnedArgs[a]
        assert(returnedArgs[a].probability, 'each argument should have a probability set');
      }


      done();
    })
  });

  it('Getting the top claim should be returned with the argument we just created', function(done) {
    api.get(`/claims/${argTestClaims.top._key}`)
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id == argTestClaims.top._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key == argTestClaims.top._key, 'returned claim should have a _key');
      assert(response.body.data.claim.arguments.length == 1, 'The top claim should now have the one argument we just added' + JSON.stringify(response.body.data.claim, null, 2));
      assert(response.body.data.claim.probability, 'The claim should have a probability');
      argTestClaims.top = response.body.data.claim;
      done();
    })
  });

  //also add the against arguments
  it('new AGAINST argument to the top test claim, should return updated top test claim', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: argTestClaims.top._id, //pass the id of the first 'top' claim we created above
      type: 'AGAINST',
      premiseIds: [argTestClaims.against1._id, argTestClaims.against2._id] //give the ids of the two 'for' claims we created above
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      let returnedArgs = response.body.data.claim.arguments;
      argTestClaims.arguments = response.body.data.claim.arguments;
      
      assert(response.body.data.claim._id == argTestClaims.top._id, 'The parent claim should be the one returned');
      assert(response.body.data.claim.arguments.length == 2, 'The claim should now have 2 arguments' + JSON.stringify(response.body.data.claim, null, 2)); 
      assert(response.body.data.claim.probability, 'The claim should have a probability');

      for (var a = 0; a < returnedArgs.length; a++) {
        assert(returnedArgs[a].probability, 'each returned argument should have a probability');
        assert(returnedArgs[a]._id, 'each returned argument should have an _id property');
        assert(returnedArgs[a]._id.indexOf('/') > 0, 'the _id property should match the arango format');
        assert(returnedArgs[a]._key, 'each returned argument should have a _key property');
        assert(returnedArgs[a]._key.indexOf('/') == -1, 'the _key property should match the arango format');
        assert(returnedArgs[a].type, 'each returned argument should have a type property');
        assert(returnedArgs[a].creationDate, 'each returned argument should have a creationDate property');
      }

      done();
    })
  });

  it('Getting the top claim should be returned with both the new arguments', function(done) {
    api.get(`/claims/${argTestClaims.top._key}`)
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id == argTestClaims.top._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key == argTestClaims.top._key, 'returned claim should have a _key');
      assert(response.body.data.claim.arguments.length == 2, 'The top claim should now have both the arguments we just added');
      assert(response.body.data.claim.probability, 'The claim should have a probability');
      argTestClaims.top = response.body.data.claim;
      done();
    })
  });

  //getting the parent claim should return the claim with argument data nested within it
  it('Getting the parent claim Should return the claim with populated argument data', function(done) {
    api.get(`/claims/${argTestClaims.top._key}`)
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      assert(response.body.data.claim.text == argTestClaims.top.text, 'Returned claim should have the text we\'re expecting');
      assert(response.body.data.claim._id == argTestClaims.top._id, 'Returned claim should have the id we\'re expecting');
      assert(response.body.data.claim.arguments.length == 2, 'Returned claim should have the the 2 arguments we added');
      assert(response.body.data.claim.probability, 'The claim should have a probability');
      assert(response.body.data.claim.arguments[0].hasOwnProperty('premises'), 'The arguments in the claim should have an array of premises');
      assert(response.body.data.claim.arguments[0].premises[0].hasOwnProperty('_id'), 'The premises in the argument should be populated');
      
      done();
    })
  });

  //test the probability stuff


  //remove the arguments (should also remove the premise links)
  it('Delete for argument', function(done) {
    api.del('/arguments').send({ _id: argTestClaims.arguments[0]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  
  it('Delete against argument', function(done) {
    api.del('/arguments').send({ _id: argTestClaims.arguments[1]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

  //remove the claims
  it('Delete top claim', function(done) {
    api.del('/claims').send({ _id: argTestClaims.top._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete against 1', function(done) {
    api.del('/claims').send({ _id: argTestClaims.against1._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete against 1', function(done) {
    api.del('/claims').send({ _id: argTestClaims.against2._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete for 1', function(done) {
    api.del('/claims').send({ _id: argTestClaims.for1._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete for 2', function(done) {
    api.del('/claims').send({ _id: argTestClaims.for2._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

});
