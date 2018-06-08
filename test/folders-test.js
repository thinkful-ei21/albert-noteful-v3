'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server.js');

const { TEST_MONGODB_URI } = require('../config.js');

const Folder = require('../models/folder.js');

const seedFolders = require('../db/seed/folders.json');

const expect = chai.expect;

chai.use(chaiHttp);

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

  describe('GET /api/folders', function() {
    it('should retrieve a list of folders', function() {
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
          expect(apiFolders.body.length).to.equal(dbFolders.length);
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
          });
      });
    });
  
  });































});