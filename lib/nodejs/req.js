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
    fn(e, null, {statusCode: res.statusCode, headers: res.headers});
	});			
	res.on('end',function(){
		try {
			data = JSON.parse(data);
		}catch(e){
		}
    fn(null, data, {statusCode: res.statusCode, headers: res.headers});
	});
}
function ajax(config, fn){
	var urlParsed = url.parse(config.url);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: config.method,
    agent: "DISP/3.0 (Github disp3)",
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	if(config.headers) options.headers = config.headers;
	var protocol = urlParsed.protocol || "http:";
	var req;
	if(protocol == "http:"){
		req = http.request(options,function(res){
			parseRes(res, fn);
		});
	}else if(protocol == "https:"){
		req = https.request(options,function(res){
			parseRes(res, fn);
		});
	}
	if(config.data)
		req.write(config.data);
	req.end();
}

var methods = {};
methods.ajax = ajax;
["get", "post", "put", "delete"].forEach(function(method){
  methods[method] = function(url, data, fn){
    if(!fn) fn = data;
    var config = {url: url, method: method.toUpperCase()};
    if(data) config.data = data;
    ajax(config, fn);
  };
  methods[method + "Ex"] = function(url, headers, data, fn){
    if(!fn) fn = data;
    var config = {url: url, method: method.toUpperCase(), headers: headers};
    if(data) config.data = data;
    ajax(config, fn);
  };
  methods[method+"Bearer"] = function(url, token, data, fn){
    methods[method + "Ex"](url, {
      Authorization: "Bearer "+token
    }, data, fn);
	};
  methods[method+"Form"] = function(url, data, fn){
    methods[method + "Ex"](url, {
      "Content-type": "application/x-www-form-urlencoded"
    }, data, fn);
  };
  methods[method+"Json"] = function(url, data, fn){
    methods[method + "Ex"](url, {
      "Content-type": "application/json"
    }, data, fn);
  };
  methods[method + "Cookies"] = function(url, cookies, data, fn){
    var cookiearr = [];
    for(var key in cookies)
      cookiearr.push(key + "=" + cookies[key]);
    methods[method + "Ex"](url, {
      Cookie: cookiearr.join("; ")
    }, data, fn);
  };
});
module.exports = methods;

