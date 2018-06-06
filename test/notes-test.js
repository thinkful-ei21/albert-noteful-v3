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





  // describe('POST /api/notes', function() {
  //   it('should create and return a new item when provided valid data', function() {
  //     const newItem = {
  //       'title': 'The best article about cats ever!',
  //       'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
  //     };

  //     let res;
  //     // 1) First, call the API
  //     return chai.request(app)
  //       .post('/api/notes')
  //       .send(newItem)
  //       .then(function(_res) {
  //         res = _res;
  //         expect(res).to.have.status(201);
  //         expect(res).to.have.header('location');
  //         expect(res).to.be.json;
  //         expect(res.body).to.be.a('object');
  //         expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
  //         // 2) then call the database
  //         return Note.findById(res.body.id);
  //       })
  //       // 3) then compare the API response to the database results
  //       .then(function(data) {
  //         expect(res.body.id).to.equal(data.id);
  //         expect(res.body.title).to.equal(data.title);
  //         expect(res.body.content).to.equal(data.content);
  //         expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
  //         expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
  //       });
  //   });
  // });





  // describe('GET /api/notes/:id', function() {
  //   it('should return correct note', function() {
  //     let data;
  //     // 1) First, call the database
  //     return Note.findOne()
  //       .then(function(_data) {
  //         data = _data;
  //         // 2) then call the API with the ID
  //         return chai.request(app).get(`/api/notes/${data.id}`);
  //       })
  //       .then(function(res) {
  //         expect(res).to.have.status(200);
  //         expect(res).to.be.json;

  //         expect(res.body).to.be.an('object');
  //         expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

  //         // 3) then compare database results to API response
  //         expect(res.body.id).to.equal(data.id);
  //         expect(res.body.title).to.equal(data.title);
  //         expect(res.body.content).to.equal(data.content);
  //         expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
  //         expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
  //       });
  //   });
  // });
















































});