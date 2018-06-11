'use strict';

const app = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;
chai.use(chaiHttp);

const { TEST_MONGODB_URI } = require('../config.js');
const Folder = require('../models/folder.js');
const seedFolders = require('../db/seed/folders.json');

describe('FOLDER TESTING', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Folder.insertMany(seedFolders);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/folders - v2', function() {
    it('should retrieve a list of folders (v1)', function() {
      let apiFolders;
      return chai
        .request(app)
        .get('/api/folders')
        .then(function(folders) {
          apiFolders = folders;
          return Folder.find();
        })
        .then(function(dbFolders) {
          expect(apiFolders).to.be.json;
          expect(apiFolders.body).to.be.an('array');
          expect(dbFolders).to.be.an('array');
          expect(dbFolders.length).to.equal(apiFolders.body.length);
        });
    });
  });

  describe('GET /api/folders', function() {
    it('should retrieve a list of folders (v2)', function() {
      let dbFolders;
      return Folder
        .find()
        .then(function(folders) {
          dbFolders = folders;
          return chai
            .request(app)
            .get('/api/folders');
        })
        .then(function(apiFolders) {
          expect(apiFolders).to.have.status(200);
          expect(apiFolders).to.be.json;
          expect(apiFolders.body).to.be.an('array');
          expect(dbFolders).to.be.an('array');
          expect(apiFolders.body.length).to.equal(dbFolders.length);
        });
    });
  });

  describe('GET /api/folders/:id', function() {
    it('should retreive a single folder when provided a valid folder ID', function() {
      let dbFolder;
      return Folder
        .findOne()
        .then(function(folder) {
          dbFolder = folder;
          return chai
            .request(app)
            .get(`/api/folders/${dbFolder.id}`);
        })
        .then(function(apiFolder) {
          expect(apiFolder).to.have.status(200);
          expect(apiFolder).to.be.json;
          expect(apiFolder.body[0]).to.equal(dbFolder[0]);
        });
    });
  });

  describe('POST /api/folders', function() {
    it('create a new folder when provided valid data (v1)', function() {
      let newFolder = {name: 'Important'};
      let apiResponse;
      return chai
        .request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function(res) {
          apiResponse = res;
          return Folder
            .findById(apiResponse.body.id);
        })
        .then(function(dbResponse) {
          expect(dbResponse).to.be.an('object');
          expect(dbResponse.name).to.equal(newFolder.name);
          expect(apiResponse.body.name).to.equal(newFolder.name);
        });
    });
  });

  describe('POST /api/folders', function() {
    it('create a new folder when provided valid data (v2)', function() {
      let newFolder = {name: 'NSFW'};
      let dbResponse;
      return Folder
        .create(newFolder)
        .then(function(res) {
          dbResponse = res;
          return chai
            .request(app)
            .get(`/api/folders/${dbResponse.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.be.json;
          expect(dbResponse.name).to.equal(newFolder.name);
          expect(apiResponse.body.name).to.equal(newFolder.name);
        });
    });
  });

  describe('PUT /api/folders', function() {
    it('should update an existing folder when provided valid data', function() {
      const updateFolder = {name: 'Test'};
      let dbResponse;
      return Folder
        .findOne()
        .then(function(res) {
          return Folder
            .findByIdAndUpdate(res.id, updateFolder, {new: true});
        })
        .then(function(res) {
          dbResponse = res;
          expect(dbResponse.name).to.equal(updateFolder.name);
          return chai
            .request(app)
            .get(`/api/folders/${dbResponse.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.be.json;
          expect(apiResponse.body.name).to.equal(updateFolder.name);
        });
    });
  });

  describe('DELETE /api/tags/:id', function() {
    it('should delete a tag when provided valid corresponding ID', function() {
      let dbResponse;
      return Folder
        .findOne()
        .then(function(res) {
          dbResponse = res;
          return chai
            .request(app)
            .delete(`/api/folders/${res.id}`);
        })
        .then(function(apiResponse) {
          expect(apiResponse).to.have.status(204);
          return Folder
            .findById(dbResponse.id);
        })
        .then(function(res) {
          expect(res).to.be.null;
        });
    });
  });

});
