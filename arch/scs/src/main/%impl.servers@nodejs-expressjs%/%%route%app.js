var auth = require("./auth").midware;
var auths = require("./auth").midwares;
var multiparty = require('connect-multiparty');
var multiparts = {};
var uploadPath = "upload";
function multipart(field){
	if(!multiparts[field]){
		var udir = path.resolve(uploadPath + "/" + field);
		libFile.mkdirpSync(udir);
		multiparts[field] = multiparty({uploadDir: udir});
	}
	return multiparts[field];
}
var router = express.Router();
^^
for(var i=0; i<withApis.length; i++){ 
	var api = global.proto.apis[withApis[i]];
	var paramsStr = makeParamsStr(api);
	var midwaresStr = makeMidwaresStr(api);
	var controllerStr = api.controller || api.name;
	if(!api.method) console.log("no method !!!!");
$$
router.route('/^^=api.route$$^^=paramsStr$$')
		.^^=api.method$$(^^=midwaresStr$$^^=controllerStr$$);
^^if(!api.controller) makeController(api);
}$$

app.use('/api', router);


^^function makeController(api){$$
function ^^=api.name$$(req, res){
^^checkParams(api)$$
 ^^for(var j in api.controllers){
  var ctrl = api.controllers[j];
  var result= ctrl.result || "result";
 $$
^^=ctrl.pre || ""$$;
  ^^if(ctrl.type == "raw"){$$
  ^^}else if(ctrl.type == "async"){$$
^^=ctrl.method$$(^^=ctrl.params$$, function(err, ^^=result$$){
	if(err) return sendErr(res, err);
  ^^}else if(ctrl.type == "async2"){$$
^^=ctrl.method$$(^^=ctrl.params$$, function(err, ^^=result$$){
	if(err) return sendErr(res, err);
  ^^}else if(ctrl.type == "db"){$$
^^makeDbQuery(ctrl)$$
  ^^}$$

  ^^if(ctrl.check){
	 for(var key in ctrl.check){
	  var check = ctrl.check[key];$$
	 ^^if(typeof check == "string"){$$
if(^^=key$$) return sendErr(res, "^^=check$$");
	 ^^}else if(check.raw){$$
if(^^=key$$) return sendErr(res, ^^=check.raw$$);
   ^^}else{$$
if(^^=key$$) return sendErr(res, "^^=check.message$$", "^^=check.code$$");
   ^^}$$
  ^^}}$$

  ^^if(ctrl.presend){
	 for(var key in ctrl.presend){
	  var presend = ctrl.presend[key];$$
if(^^=key$$) return sendJson(res, ^^=presend$$);
  ^^}}$$

  ^^if(ctrl.do){$$
^^=ctrl.do$$
  ^^}$$

  ^^if(ctrl.send){$$
sendJson(res, ^^=ctrl.send$$);
  ^^}$$

  ^^if(ctrl.sendJson){$$
sendJson(res, ^^=JSON.stringify(ctrl.sendJson)$$);
  ^^}$$

 ^^}$$
	^^=local[api.name]$$

 ^^for(var j=api.controllers.length-1; j>=0; j--){
	var ctrl = api.controllers[j];$$
  ^^if(ctrl.type == "async" || ctrl.type == "db"){$$
	});
  ^^}$$
 ^^}$$
};
^^}$$

^^function makeDbQuery(ctrl){
 var method = ctrl.method;
 var result= ctrl.result || "result";
$$
^^if(method == "update" || method == "bupdate" || method =="upsert" || method == "update2" || method == "bupdate2" || method == "sedate" || method == "sedate2"){
$$
db.getModel("^^=ctrl.schema$$").^^=ctrl.method$$(^^=ctrl.where$$, ^^=ctrl.set$$, function(err, ^^=result$$){
^^}else if(method == "bselect" || method == "bcolect"){
$$
db.getModel("^^=ctrl.schema$$").^^=ctrl.method$$(^^=ctrl.where$$, ^^=ctrl.op||"{}"$$, function(err, ^^=result$$){
^^}else if(method == "select" || method == "delete" || method == "bdelete" ){
$$
db.getModel("^^=ctrl.schema$$").^^=ctrl.method$$(^^=ctrl.where$$, function(err, ^^=result$$){
^^}else if(method == "binsert" || method == "insert"){
$$
db.getModel("^^=ctrl.schema$$").^^=ctrl.method$$(^^=ctrl.doc$$, function(err, ^^=result$$){
^^}$$
	if(err) return sendErr(res, err);
^^}$$

^^function checkParams(api){$$
	var params = {};
 ^^for(var key in api.params){var param = api.params[key];$$

^^if(param.isQuery){$$
	var ^^=key$$ = req.query["^^=key$$"];
^^}else if(param.isMultipartFile){$$
	var ^^=key$$;
	if(req.files["^^=key$$"]) ^^=key$$ = req.files["^^=key$$"].path;
^^}else if(!param.isParams){$$
	var ^^=key$$ = req.body["^^=key$$"];
^^}else{$$
	var ^^=key$$ = req.params["^^=key$$"];
^^}$$

 ^^if(param.required){$$
	if(^^=key$$ == undefined) return sendErr(res, "参数错误：没有^^=key$$");
 ^^}$$

 ^^if(param.type == "string"){$$
	if(^^=key$$) ^^=key$$  = ^^=key$$.toString();
 ^^}else if(param.type == "float"){$$
	^^=key$$ = parseFloat(^^=key$$);
 ^^}else if(param.type == "int"){$$
	^^=key$$ = parseInt(^^=key$$);
 ^^}else{$$
 ^^}$$
 params["^^=key$$"] = ^^=key$$;
^^}}$$

/*^^function makeMidwaresStr(api){
	var midwaresStr = "";
	for(var j in api.midwares){
		var midware= api.midwares[j];
		midwaresStr += midware + ", ";
	}
	return midwaresStr;
}$$*/

/*^^function makeParamsStr(api){
	var paramsStr = "";
	for(var key in api.params){
		var param = api.params[key];
		if(param.isParams) paramsStr += "/:" + key;
	}
	return paramsStr;
}$$*/

/*^^function makeReq(json){
	var arr = [];
	for(var key in json){
		arr.push(key + ":" + json[key]);
	}
	return arr.join(",");
}$$*/


