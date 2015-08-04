var http = require('http');
var https = require('https');
var querystring = require('querystring');
var url = require("url");
function strlen(str){
	return new Buffer(str).length;
}

function parseRes(res, fn){
	var data = "";
	var isText;
	var ct = res.headers["content-type"];
	if(ct && ct.match("image")){
		isText = false;
		res.setEncoding("binary");
	}else{
		isText = true;
		res.setEncoding("utf8");
	}
	res.on('data', function (chunk) {
		data += chunk;
	});
	res.on('error', function (e) {
		if(fn) fn(e, null, {statusCode: res.statusCode, headers: res.headers});
	});			
	res.on('end',function(){
		if(isText)
			try {
				data = JSON.parse(data);
			}catch(e){
			}		
		if(fn) fn(null, data, {statusCode: res.statusCode, headers: res.headers});
	});
}
var Req = function(){
	var self = this;
	var uastr = "disp3/alpha";
	var defaultOptions = {
		agent: false,
		rejectUnauthorized : false
	};
	function ajax(config, fn){
		if(config.url[0].match(/[\dl]/)) config.url = "http://" + config.url;
		var urlParsed = url.parse(config.url);	
		var options = {};
		for(var key in defaultOptions){
			options[key] = defaultOptions[key];
		}
		if(!options.headers) options.headers = {};
		if(!options.headers["user-agent"])
			options.headers["user-agent"] = uastr;
		options.host = urlParsed.hostname;
		options.path = urlParsed.path;
		options.method = config.method || "get";
		if(urlParsed.port) options.port = urlParsed.port;		
		if(config.headers)
			for(var key in config.headers)
				options.headers[key] = config.headers[key];
		
		var protocol = urlParsed.protocol || "http:";
		var req;
		if(protocol == "http:"){
			req = http.request(options);
		}else if(protocol == "https:"){
			req = https.request(options);
		}else{
			if(fn) fn("wrong protocol " + protocol);
			return;
		}
		if(config.data){
			if(typeof config.data === "string"){
				req.write(config.data);
			}else{
				console.error("data is not string");
				console.error(config.data);
			}
		}
		req.once("response", function(res){
			if(config.stream)
				fn(null, res);
			else
				parseRes(res, fn);
		});

		req.on('error', function(error) {
			if(fn) fn(error);
		});
		req.end();

	}

	self.ajax = ajax;
	["get", "post", "put", "delete"].forEach(function(method){

		self[method + "Ex"] = function(url, headers, param1, param2){
			var fn, data;
			if(!param2){
				fn = param1;
				data = "";
			}else{
				fn = param2;
				data = param1;
			}
			if(!headers) headers = {};
			var config = {url: url, method: method.toUpperCase(), headers: headers};
			if(data){
				if(typeof data === "string")
					config.data = data;
				else
					config.data = JSON.stringify(data);
				if(!headers["Content-type"]){
					headers["Content-type"] = "application/json";
					headers["Content-Length"] = strlen(config.data);
				}
			}
			ajax(config, fn);
		};
		self[method] = function(url, data, fn){
			self[method + "Ex"](url, {}, data, fn);
		};
		self[method+"Bearer"] = function(url, token, json, fn){
			var data = JSON.stringify(json);
			self[method + "Ex"](url, {
				Authorization: "Bearer " + token
			}, data, fn);
		};
		self[method+"Form"] = function(url, json, fn){
			var data = querystring.stringify(json);
			self[method + "Ex"](url, {
				"Content-type": "application/x-www-form-urlencoded",
				"Content-Length" : strlen(data)
			}, data, fn);
		};
		self[method+"Json"] = function(url, json, fn){
			var data = JSON.stringify(json);
			self[method + "Ex"](url, {
				"Content-type": "application/json",
				"Content-Length" : strlen(data)
			}, data, fn);
		};
		self[method + "Cookies"] = function(url, cookies, data, fn){
			var cookiearr = [];
			for(var key in cookies)
				cookiearr.push(key + "=" + cookies[key]);
			self[method + "Ex"](url, {
				Cookie: cookiearr.join("; ")
			}, data, fn);
		};
		self[method + "FormCookies"] = function(url, cookies, json, fn){
			var cookiearr = [];
			for(var key in cookies)
				cookiearr.push(key + "=" + cookies[key]);
			var data = querystring.stringify(json);
			self[method + "Ex"](url, {
				"Content-type": "application/x-www-form-urlencoded",
				"Content-Length" : strlen(data),
				Cookie: cookiearr.join("; ")
			}, data, fn);
		};
	});
	//modified from git://github.com/jshttp/fresh
	self.fresh = function(reqheaders, resheaders){

		// defaults
		var etagMatches = true;
		var notModified = true;

		// fields
		var modifiedSince = reqheaders['if-modified-since'];
		var noneMatch = reqheaders['if-none-match'];
		var lastModified = resheaders['last-modified'];
		var etag = resheaders['etag'];
		var cc = reqheaders['cache-control'];

		// unconditional request
		if (!modifiedSince && !noneMatch) return false;
		// check for no-cache cache request directive
		if (cc && cc.indexOf('no-cache') !== -1) return false;

		// parse if-none-match
		if (noneMatch) noneMatch = noneMatch.split(/ *, */);

		// if-none-match
		if (noneMatch) etagMatches = ~noneMatch.indexOf(etag) || '*' == noneMatch[0];

		// if-modified-since
		if (modifiedSince) {
			modifiedSince = new Date(modifiedSince);
			lastModified = new Date(lastModified);
			notModified = lastModified <= modifiedSince;
		}

		return !! (etagMatches && notModified);
	}
	self.setuastr = function(str){
		uastr = str;
	}
	self.setoptions = function(obj){
		for(var key in obj){
			defaultOptions[key] = obj[key];
		}
	}
};
module.exports = new Req();
module.exports.ins = Req;

