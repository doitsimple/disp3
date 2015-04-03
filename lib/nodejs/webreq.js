var http = require('http');
var https = require('https');
var querystring = require('querystring');
var url = require("url");
var libString = require("./string");
function _post(protocol, options, content, fn){
	var req;
	if(protocol == "http:"){
		var data = "";
		req = http.request(options,function(res){
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('error', function (e) {
        fn(e, {statusCode: res.statusCode});
			});			
			res.on('end',function(){
				var doc = {};
				doc.statusCode = res.statusCode;
				try {
					doc.data = JSON.parse(data);
				}catch(e){
					doc.data = data;
				}
        fn(null, doc, res.headers);
			});
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('error', function (e) {
        fn(e, {statusCode: res.statusCode});
			});			
			res.on('end',function(){
				var doc = {};
				doc.statusCode = res.statusCode;
				try {
					doc.data = JSON.parse(data);
				}catch(e){
					doc.data = data;
				}
        fn(null, doc, res.headers);
			});
		});
	}else{
		console.error("wrong protocol "+ urlParsed.protocol);
		process.exit(1);
	}
	req.write(content);
	req.end();
}
function _get(protocol, options, fn){
	var req;
	if(protocol == "http:"){
		var data = "";
		req = http.request(options,function(res){
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('error', function (e) {
        fn(e, {statusCode: res.statusCode});
			});			
			res.on('end',function(){
				var doc = {};
				doc.statusCode = res.statusCode;
				try {
					doc.data = JSON.parse(data);
				}catch(e){
					doc.data = data;
				}
        fn(null, doc);
			});
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('error', function (e) {
        fn(e, {statusCode: res.statusCode});
			});			
			res.on('end',function(){
				var doc = {};
				doc.statusCode = res.statusCode;
				try {
					doc.data = JSON.parse(data);
				}catch(e){
					doc.data = data;
				}
        fn(null, doc);
			});
		});
	}else{
		console.error("wrong protocol "+ urlParsed.protocol);
		process.exit(1);
	}
	req.end();
}
function get(urlStr, fn){
	var urlParsed = url.parse(urlStr);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'GET',
    agent: false,
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_get(urlParsed.protocol, options, fn);
}
function _delete_(urlStr, fn){
	var urlParsed = url.parse(urlStr);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'DELETE',
    agent: false,
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_get(urlParsed.protocol, options, fn);
}

function postForm(urlStr, json, fn){
	var urlParsed = url.parse(urlStr);	
	var content = querystring.stringify(json);
//	console.log(content);
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'POST',
    agent: false,
    rejectUnauthorized : false,
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded', 
      'Content-Length' : libString.strlen(content)
    }
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_post(urlParsed.protocol, options, content, fn);
}
function postJSON(urlStr, json, fn){
	var urlParsed = url.parse(urlStr);	
	var content = JSON.stringify(json);
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'POST',
    agent: false,
    rejectUnauthorized : false,
    headers: {
      'Content-Type' : 'application/json',
      'Content-Length' : libString.strlen(content)
    }
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_post(urlParsed.protocol, options, content, fn);
}
function putJSON(urlStr, json, fn){
	var urlParsed = url.parse(urlStr);	
	var content = JSON.stringify(json);
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'PUT',
    agent: false,
    rejectUnauthorized : false,
    headers: {
      'Content-Type' : 'application/json', 
      'Content-Length' : libString.strlen(content)
    }
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_post(urlParsed.protocol, options, content, fn);
}
module.exports = {
	postForm: postForm,
	postJSON: postJSON,
	putJSON: putJSON,
	get: get,
	delete: _delete_
}

