var express = require('express');
var bodyParser = require('body-parser');
/*
var libReq = require("../lib/req");
var libDate = require("../lib/date");
var libEncrypt = require("../lib/encrypt");
var libRandom = require("../lib/random");
var libString = require("../lib/string");
var libObject = require("../lib/object");
var libFile = require("../lib/file");
var libRes = require("./response");
var log= require("../lib/log");
var path = require("path");
var common = require("./common");
var sendErr = libRes.sendErr;
var sendFile = libRes.sendFile;
var sendJson = libRes.sendJson;
var db = require("../db");
^^=require$$
var checkpoints = require("./checkpoints");
^^=config$$
^^=method$$
*/
var app = express();
^^if(parser.form){$$
 ^^if(parser.query){$$
app.use(bodyParser.urlencoded({extended: true}));
 ^^}else{$$
app.use(bodyParser.urlencoded());
 ^^}$$
^^}$$
^^if(parser.json){$$
app.use(bodyParser.json());
^^}$$
/*
app.use("^^=key$$", express.static(__dirname + '/'));
*/
^^=main$$
module.exports = app;
