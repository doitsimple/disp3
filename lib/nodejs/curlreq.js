var cp = require("child_process");
var querystring = require('querystring');
module.exports.postFormCookies = postFormCookies;

function postFormCookies(url, cookies, body, fn){
	var cookiearr = [];
	for(var key in cookies)
    cookiearr.push(key + "=" + cookies[key]);
	var str = "curl \"" + url + "\""
				+ " -H \"Cookie: " 
				+ cookiearr.join("; ").replace(/%/g, "\"%\"") + '\"'
				+ ' -H "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded"' 
				+ ' -H "Referer: https://www.huobi.com/trade/cny_btc" -H "X-Requested-With: XMLHttpRequest"' 
				+ ' --data "' + querystring.stringify(body) + '" --compressed';
	cp.exec(str, function(err, stdout){
		if(err) return fn(err);
		var result;
		try{
			result = JSON.parse(stdout);
		}catch(e){
			result = stdout;
		}
		fn(null, result);
	})
}
