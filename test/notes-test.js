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
    it('should return a list of notes', function() {
      let dbNotes;
      // 1) call DB for all notes
      return Note
        .find()
        .then(function(notes) {
          dbNotes = notes;
          // 2) call the API for all notes
          return chai
            .request(app)
            .get('/api/notes/');
        })
        // 3) check API notes
        .then(function(apiNotes) {
          expect(apiNotes).to.have.status(200);
          expect(apiNotes).to.be.json;
          // 4) compare DB notes to API notes
          expect(apiNotes.body).to.be.an('array');
          expect(apiNotes.body.length).to.equal(dbNotes.length);
        });
    });
  });

  describe('GET /api/notes/:id', function() {
    it('should return a single note when provided a valid corresponding ID', function() {
      let dbNote;
      // 1) call DB for a random note
      return Note
        .findOne()
        .then(function(note) {
          dbNote = note;
          // 2) call API for note with corresponding ID,
          return chai
            .request(app)
            .get(`/api/notes/${dbNote.id}`);
        })
        // 3) check API note
        .then(function(apiNote) {
          expect(apiNote).to.have.status(200);
          expect(apiNote).to.be.json;
          expect(apiNote.body).to.be.an('object');
          expect(apiNote.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 4) compare DB note to API note
          expect(apiNote.body.id).to.equal(dbNote.id);
          expect(apiNote.body.title).to.equal(dbNote.title);
          expect(apiNote.body.content).to.equal(dbNote.content); // .equal() means strict equal
          expect(new Date(apiNote.body.createdAt)).to.eql(dbNote.createdAt); // .eql() means deep equal
          expect(new Date(apiNote.body.updatedAt)).to.eql(dbNote.updatedAt);
        });
    });
  });

  describe('GET /api/notes', function() {
    it('should return a list of notes with titles matching a search term', function() {
      const searchTerm = 'ways';
      let apiResponse;
      // 1) call API for list of notes with titles matching search term
      return chai
        .request(app)
        .get(`/api/notes/?searchTerm=${searchTerm}`)
        .then(function(res) {
          apiResponse = res;
          // 2) check API response, there should be 2 notes where titles contain the word 'ways'
          expect(apiResponse).to.have.status(200);
          expect(apiResponse).to.be.json;
          expect(apiResponse.body).to.be.an('array');
          expect(apiResponse.body.length).to.equal(2);
          // 3) call DB with same search term
          return Note
            .find({title: {$regex: searchTerm}})
            .sort({updatedAt: 'desc'});
        })
        .then(function(dbResponse) {
          // 4) compare DB response to API response
          expect(dbResponse).to.be.an('array');
          expect(apiResponse.body.length).to.equal(dbResponse.length);
        });
    });
  });

  describe('POST /api/notes', function() {
    it('should create and return a new item when provided valid data', function() {
      const newNote = {
        title: 'The best article about cats ever!',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
      let apiResponse;
      // 1) call API to create note
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
          // 2) call DB for new note by its ID
          return Note
            .findById(apiResponse.body.id);
        })
        // 3) then compare API response to DB response
        .then(function(dbResponse) {
          expect(apiResponse.body.id).to.equal(dbResponse.id);
          expect(apiResponse.body.title).to.equal(dbResponse.title);
          expect(apiResponse.body.content).to.equal(dbResponse.content);  // .equal() means strict equal
          expect(new Date(apiResponse.body.createdAt)).to.eql(dbResponse.createdAt);  // .eql() means deep equal
          expect(new Date(apiResponse.body.updatedAt)).to.eql(dbResponse.updatedAt);
        });
    });
  });

  describe('PUT api/notes/:id', function() {
    it('should update an existing note when provided a valid corresponding data', function() {
      const updateNote = {
        title: 'Updated Title',
        content: 'Updated contents.'
      };
      let randomNote;
      // 1) call DB for a random note
      return Note
        .findOne()
        .then(function(note) {
          randomNote = note;
          // 2) call API to update note with corresponding ID
          return chai
            .request(app)
            .put(`/api/notes/${randomNote.id}`)
            .send(updateNote);
        })
        // 3) check to see if API response is same as updateNote
        .then(function(apiResponse) {
          expect(apiResponse).to.have.status(200);
          expect(apiResponse.body.title).to.equal(updateNote.title);
          expect(apiResponse.body.content).to.equal(updateNote.content);
          // 4) call DB for corresponding note
          return Note
            .findById(randomNote.id);
        })
        // 5) check to see if DB response is same as updateNote
        .then(function(dbResponse) {
          expect(dbResponse).to.be.an('object');
          expect(dbResponse.title).to.equal(updateNote.title);
          expect(dbResponse.content).to.equal(updateNote.content);
        });
    });
  });

  describe('DELTE /api/notes/:id', function() {
    it('should delete a note when provided a valid corresponding ID', function() {
      let dbNote;
      // 1) Call DB for a random note,
      return Note
        .findOne()
        .then(function(note) {
          dbNote = note;
          // 2) call API to delete note with corresponding ID
          return chai
            .request(app)
            .delete(`/api/notes/${dbNote.id}`);
        })
        //3) check API response for Status 204
        .then(function(apiResponse) {
          expect(apiResponse).to.have.status(204);
          // 4) call DB for corresponding note
          return Note
            .findById(dbNote.id);
        })
        // 5) check to see if DB response with null
        .then(function(dbResponse) {
          expect(dbResponse).to.be.null;
        });
    });
  });

});