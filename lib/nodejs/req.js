var http = require('http');
var https = require('https');
var querystring = require('querystring');
var url = require("url");
var uastr = "disp3/alpha";
function strlen(str){
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
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
    fn(e, null, {statusCode: res.statusCode, headers: res.headers});
	});			
	res.on('end',function(){
		if(isText)
			try {
				data = JSON.parse(data);
			}catch(e){
			}		
    fn(null, data, {statusCode: res.statusCode, headers: res.headers});
	});
}
function ajax(config, fn){
	if(config.url[0].match(/[\dl]/)) config.url = "http://" + config.url;
	var urlParsed = url.parse(config.url);	
	var options = {
    host: urlParsed.hostname,
    path: urlParsed.path,
    method: config.method,
		agent: false,
    rejectUnauthorized : false
	};
	if(urlParsed.port) options.port = urlParsed.port;
	options.headers = config.headers?config.headers:{};
	options.headers["user-agent"] = uastr;
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
	}else{
		fn("wrong protocol " + protocol);
	}
	if(config.data){
		if(typeof config.data === "string"){
			req.write(config.data);
		}else{
			console.error("data is not string");
			console.error(config.data);
		}
	}
	req.end();
}

var methods = {};
methods.ajax = ajax;
["get", "post", "put", "delete"].forEach(function(method){
  methods[method + "Ex"] = function(url, headers, data, fn){
    if(!fn) fn = data;
		if(!headers) headers = {};
    var config = {url: url, method: method.toUpperCase(), headers: headers};
    if(data) 
			if(typeof data === "string")
				config.data = data;
			else
				config.data = JSON.stringify(data);
		if(!headers["Content-type"]){
      headers["Content-type"] = "application/json";
      headers["Content-Length"] = strlen(config.data);
		}
    ajax(config, fn);
  };
  methods[method] = function(url, data, fn){
    if(!fn) fn = data;
		methods[method + "Ex"](url, {}, data, fn);
  };
  methods[method+"Bearer"] = function(url, token, json, fn){
		var data = JSON.stringify(json);
    methods[method + "Ex"](url, {
      Authorization: "Bearer "+token
    }, data, fn);
	};
  methods[method+"Form"] = function(url, json, fn){
		var data = querystring.stringify(json);
    methods[method + "Ex"](url, {
      "Content-type": "application/x-www-form-urlencoded",
      "Content-Length" : strlen(data)
    }, data, fn);
  };
  methods[method+"Json"] = function(url, json, fn){
		var data = JSON.stringify(json);
    methods[method + "Ex"](url, {
      "Content-type": "application/json",
      "Content-Length" : strlen(data)
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
//modified from git://github.com/jshttp/fresh
methods.fresh = function(reqheaders, resheaders){

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
module.exports = methods;

