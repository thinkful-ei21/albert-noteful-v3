'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server.js');

const { TEST_MONGODB_URI } = require('../config.js');

const Note = require('../models/note.js');

const seedNotes = require('../db/seed/notes.json');

const expect = chai.expect;

chai.use(chaiHttp);

describe('NOTE TESTING', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Note.insertMany(seedNotes);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/notes/', function() {
    it('description', function() {
      let allDbNotes;
      // 1) Call DB for list of notes,
      return Note
        .find()
        .then(function(allNotes) {
          allDbNotes = allNotes;
          // 2) then call the API for list of notes,
          return chai
            .request(app)
            .get('/api/notes/');
        })
        .then(function(allApiNotes) {
          expect(allApiNotes).to.have.status(200);
          expect(allApiNotes).to.be.json;
          // 3) then compare DB results to API response.
          expect(allApiNotes.body).to.be.an('array');
          expect(allApiNotes.body.length).to.equal(allDbNotes.length);
        });
    });
  });

  describe('GET /api/notes/:id', function() {
    it('description', function() {
      let dbNote;
      // 1) Call DB for a random note,
      return Note
        .findOne()
        .then(function(note) {
          dbNote = note;
          // 2) then call API with corresponding note ID,
          return chai
            .request(app)
            .get(`/api/notes/${dbNote.id}`);
        })
        .then(function(apiNote) {
          expect(apiNote).to.have.status(200);
          expect(apiNote).to.be.json;
          expect(apiNote.body).to.be.an('object');
          expect(apiNote.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 3) then compare DB results to API response.
          expect(apiNote.body.id).to.equal(dbNote.id);
          expect(apiNote.body.title).to.equal(dbNote.title);
          expect(apiNote.body.content).to.equal(dbNote.content);
          expect(new Date(apiNote.body.createdAt)).to.eql(dbNote.createdAt);
          expect(new Date(apiNote.body.updatedAt)).to.eql(dbNote.updatedAt);
        });
    });
  });

  describe('POST /api/notes', function() {
    it('should create and return a new item when provided valid data', function() {
      const newNote = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
      let apiResponse;
      // 1) Call API to create note,
      return chai
        .request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(res) {
          apiResponse = res;
          expect(apiResponse).to.have.status(201);
          expect(apiResponse).to.have.header('location');
          expect(apiResponse).to.be.json;
          expect(apiResponse.body).to.be.an('object');
          expect(apiResponse.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call DB for new note by ID,
          return Note.findById(apiResponse.body.id);
        })
        // 3) then compare API response to DB results.
        .then(function(dbResponse) {
          expect(apiResponse.body.id).to.equal(dbResponse.id);
          expect(apiResponse.body.title).to.equal(dbResponse.title);
          expect(apiResponse.body.content).to.equal(dbResponse.content);
          expect(new Date(apiResponse.body.createdAt)).to.eql(dbResponse.createdAt);
          expect(new Date(apiResponse.body.updatedAt)).to.eql(dbResponse.updatedAt);
        });
    });
  });

  describe('PUT api/notes/:id', function() {
    it('should update an existing note when provided a valid corresponding data', function() {
      const updateNote = {
        'title': 'Updated Title',
        'content': 'Updated contents.'
      };
      let id;
      return Note
        .findOne()
        .then(function(note) {
          id = note.id;
          return chai
            .request(app)
            .put(`/api/notes/${id}`)
            .send(updateNote);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal(updateNote.title);
          expect(res.body.content).to.equal(updateNote.content);
          return Note.findById(id);
        })
        .then(function(res) {
          expect(res).to.be.an('object');
          expect(res.title).to.equal(updateNote.title);
          expect(res.content).to.equal(updateNote.content);
        });
    });
  });

  describe('DELTE /api/notes/:id', function() {
    it('should delete a note when provided a valid corresponding ID', function() {
      let id;
      return Note
        .findOne()
        .then(function(note) {
          id = note.id;
          return chai
            .request(app)
            .delete(`/api/notes/${id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note.findById(id);
        })
        .then(function(res) {
          expect(res).to.be.null;
        });
    });
  });

});