var db = require("../db");
var log = require("../lib/log");
module.exports.req = function(params, fn) {
	reqAsync(params, null, fn);
}
module.exports.reqAsync = reqAsync;
/*
info: store in schema, if exists not req and return data 
force: force begin req
platform: schema name prefix
flag: affect schema name
[other]: supplemental params like code

fn
info: store in schema
 success: req complete?
*/
function reqAsync(params, asyncFn, fn) {
	if (!params.platform) return fn("no platform");
	if (!params.info) return fn("no info");
	var p;
	try {
		p = require("./" + params.platform);
		if (!p.req) return fn("not method send in platfrom");
	} catch (e) {
		return fn("platform " + params.platform + " is not found");
	}
	var schema = params.platform;
	if (params.flag) schema += "_" + params.flag;
	var Model = db.getModel(schema);
	Model.select(params.info, function(err, result) {
		if (err) return fn(err);
		console.log(params);
		if (result && result.status == 3 && !params.force) {
			if (asyncFn) asyncFn(null, {
				info: result
			});
			return fn(null, {
				info: result
			});
		}
		Model.upsert(params.info, {}, function(err) {
			if (err) return fn(err);
			var reqFn = function(err, result) {
				if (err) return fn(err);
				if (result.info)
					Model.upsert(params.info, result.info, function(err) {
						if (err) return fn(err);
						fn(null, result);
					});
				else
					fn(null, result);
			};
			if (asyncFn) {
				p.req(params, function(err, result) {
					if (err) return log.e(err);
					if (result.info)
						Model.upsert(params.info, result.info, function(err) {
							if (err) return log.e(err);
							asyncFn(err, result);
						});
				}, reqFn);
			} else {
				p.req(params, reqFn);
			}
		});
	});

}