var http = require('http');
var https = require('https');
var querystring = require('querystring');
var url = require("url");
var libString = require("./string");
function parseRes(res, fn){
	var data = "";
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
}

function _post(protocol, options, content, fn){
	var req;
	if(protocol == "http:"){

		req = http.request(options,function(res){
			parseRes(res, fn);
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			parseRes(res, fn);
		});
	}else{
		fn("wrong protocol: " + protocol);
		return;
	}
	req.write(content);
	req.end();
}
function _get(protocol, options, fn){
	var req;
	if(protocol == "http:"){
		req = http.request(options,function(res){
			parseRes(res, fn);
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			parseRes(res, fn);
		});
	}else{
		fn("wrong protocol: " + protocol);
		return;
	}
	req.end();
}
function _getraw(protocol, options, fn){
	var req;
	if(protocol == "http:"){
		req = http.request(options,function(res){
			fn(null, res);
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			fn(null, res);
		});
	}else{
		fn("wrong protocol: " + protocol);
		return;
	}
	req.end();
}

function _postraw(protocol, options, content, fn){
	var req;
	if(protocol == "http:"){
		req = http.request(options,function(res){
			fn(null, res);
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			fn(null, res);
		});
	}else{
		fn("wrong protocol: " + protocol);
		return;
	}
	req.write(content);
	req.end();
}

function getraw(urlStr, fn){
	var urlParsed = url.parse(urlStr);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'GET',
    agent: false,
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	_getraw(urlParsed.protocol, options, fn);
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
function get2(urlStr, headers, fn){
	var urlParsed = url.parse(urlStr);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: 'GET',
    agent: false,
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	options.headers = {};
	for(var key in headers)
		options.headers[key]= headers[key];

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
function postrawForm(urlStr, json, fn){
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
	_postraw(urlParsed.protocol, options, content, fn);
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
function postForm2(urlStr, json, headers, fn){
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
	for(var key in headers)
		options.headers[key]= headers[key];

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
	postForm2: postForm2,
	postJSON: postJSON,
	putJSON: putJSON,
	get: get,
	get2: get2,
	getraw: getraw,
	postrawForm: postrawForm,
	delete: _delete_
}

