//index.js
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

const user = require('./user');
const note = require('./note');

var server = express();
server.use(bodyParser.json());
server.use(cors());

//User routes
server.get('/users', user.auth ,user.list);
server.get('/user/:username', user.auth ,user.detail);
server.post('/user', user.auth ,user.create);
server.put('/user/:id', user.auth ,user.update);
server.delete('/user/:id', user.auth ,user.delete);

//Note routes
server.get('/notes/:userid', user.auth ,note.list);
server.post('/note', user.auth ,note.create);
server.put('/note/:id', user.auth ,note.update);
server.delete('/note/:id', user.auth ,note.delete);

module.exports = server