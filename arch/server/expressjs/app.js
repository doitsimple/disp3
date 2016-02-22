var express = require('express');
var bodyParser = require('body-parser');
var router = require("./router");
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
^^=main$$
for(var key in router){
	app.use(key, router[key]);
}
module.exports = app;
