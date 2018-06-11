'use strict';

const app = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;
chai.use(chaiHttp);

const { TEST_MONGODB_URI } = require('../config.js');
const Tag = require('../models/tag.js');
const seedTags = require('../db/seed/tags.json');

describe('TAG TESTING', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Tag.insertMany(seedTags);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/tags - v1', function() {
    it('should return a list of tags (v1)', function() {
      let apiTags;
      return chai
        .request(app)
        .get('/api/tags')
        .then(function(tags) {
          apiTags = tags;
          return Tag.find();
        })
        .then(function(dbTags) {
          expect(apiTags).to.be.json;
          expect(apiTags.body).to.be.an('array');
          expect(dbTags).to.be.an('array');
          expect(dbTags.length).to.equal(apiTags.body.length);
        });
    });
  });

  describe('GET /api/tags - v2', function() {
    it('should retrieve a list of tags (v2)', function() {
      let dbTags;
      return Tag
        .find()
        .then(function(tags) {
          dbTags = tags;
          return chai
            .request(app)
            .get('/api/tags');
        })
        .then(function(apiTags) {
          expect(apiTags).to.have.status(200);
          expect(apiTags).to.be.json;
          expect(apiTags.body).to.be.an('array');
          expect(dbTags).to.be.an('array');
          expect(apiTags.body.length).to.equal(dbTags.length);
        });
    });
  });

  describe('GET /api/tags/:id', function() {
    it('should retrieve a single tag when provided valid corresponding ID', function() {
      let dbTag;
      return Tag
        .findOne()
        .then(function(tag) {
          dbTag = tag;
          return chai
            .request(app)
            .get(`/api/tags/${dbTag.id}`);
        })
        .then(function(apiTag) {
          expect(apiTag).to.have.status(200);
          expect(apiTag).to.be.json;
          expect(apiTag.body[0]).to.equal(dbTag[0]);
        });
    });
  });

  describe('POST /api/tags', function() {
    it('create a new tag when provided valid data (v1)', function() {
      let newTag = {name: 'NSFW'};
      let apiResponse;
      return chai
        .request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function(res) {
          apiResponse = res;
          return Tag
            .findById(apiResponse.body.id);
        })
        .then(function(dbResponse) {
          expect(dbResponse).to.be.an('object');
          expect(dbResponse.name).to.equal(newTag.name);
          expect(apiResponse.body.name).to.equal(newTag.name);
        });
    });
  });

  describe('POST /api/tags', function() {
    it('create a new tag when provided valid data (v2)', function() {
      let newTag = {name: 'NSFW'};
      let dbResponse;
      return Tag
        .create(newTag)
        .then(function(res) {
          dbResponse = res;
          return chai
            .request(app)
            .get(`/api/tags/${dbResponse.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.be.json;
          expect(dbResponse.name).to.equal(newTag.name);
          expect(apiResponse.body.name).to.equal(newTag.name);
        });
    });
  });

  describe('PUT /api/tags', function() {
    it('should update an existing tag when provided valid data', function() {
      const updateTag = {name: 'Test'};
      let dbResponse;
      return Tag
        .findOne()
        .then(function(res) {
          return Tag
            .findByIdAndUpdate(res.id, updateTag, {new: true});
        })
        .then(function(res) {
          dbResponse = res;
          expect(dbResponse.name).to.equal(updateTag.name);
          return chai
            .request(app)
            .get(`/api/tags/${dbResponse.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.be.json;
          expect(apiResponse.body.name).to.equal(updateTag.name);
        });
    });
  });

  describe('DELETE /api/tags/:id', function() {
    it('should delete a tag when provided valid corresponding ID', function() {
      let dbResponse;
      return Tag
        .findOne()
        .then(function(res) {
          dbResponse = res;
          return chai
            .request(app)
            .delete(`/api/tags/${res.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.have.status(204);
          return Tag
            .findById(dbResponse.id);
        })
        .then(function(res) {
          expect(res).to.be.null;
        });
    });
  });

});
