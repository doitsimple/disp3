var fs = require("fs");
var libDate = require("../lib/date");
var libFile = require("../lib/file");
var libFormat = require("../lib/format");
^^for(var key in global.impl.stats){
 var stat = global.impl.stats[key];
$$
libFile.mkdirpSync("static/stat/");
module.exports.^^=stat.name$$ = function(fn){
 var hash= {};
 var filename = "^^=stat.name$$-" + libDate.getDate(new Date())+".csv";
	if(fs.existsSync("static/stat/"+filename))
		 return fn(null, fs.createReadStream("static/stat/"+filename));
 ^^for(var schema in stat.schemas){
	 var sc = stat.schemas[schema];
   var fkeydef = global.proto.schemas[schema].fields[sc.key];
   var fvaldef = global.proto.schemas[schema].fields[sc.val];
	 var key2 = "";
	 var cd = 0;
	 for(var dim in sc.dims){
		 cd ++;
		 var fdef = global.proto.schemas[schema].fields[dim];
		 if(fdef && fdef.type == "date")
			 key2 += "libDate.getDate(doc."+dim +")";
		 else
			 key2 += "doc."+dim;
		 if(cd != 1)
			 key2 += "+'\t'";
	 }
	 if(!key2) key2 = '"c"';
 $$
 db.getModel("^^=schema$$").each(function(err, doc){
	if(err) return log.e(err);
  ^^if(fkeydef.type == "datetime"){$$
	 var key = libDate.getDate(doc["^^=sc.key$$"]);
  ^^}else{$$
   var key = doc["^^=sc.key$$"];
  ^^}$$
	 var key2 = ^^=key2$$;
   if(!hash[key]) hash[key] = {};
  ^^if(sc.type == "sum"){$$
	if(!hash[key][key2]) hash[key][key2] = 0;
	if(doc["^^=sc.val$$"])
		hash[key][key2] +=doc["^^=sc.val$$"];
  ^^}else if(sc.type == "count"){$$
	if(!hash[key][key2]) hash[key][key2] = 0;
	if(doc["^^=sc.val$$"])
		hash[key][key2] ++;
  ^^}else if(sc.type=="freq"){$$
	if(!hash[key][key2]) hash[key][key2] = {};
  ^^if(fvaldef.type == "datetime"){$$
	var val = libDate.getDate(doc["^^=sc.val$$"]);
  ^^}else{$$
	var val = doc["^^=sc.val$$"];
  ^^}$$
	if(!hash[key][key2][val]) hash[key][key2][val] = 0;
	hash[key][key2][val] ++;
  ^^}$$
 }, function(){  
	
 ^^}$$
   ^^if(sc.type == "freq"){$$
		 for(var key in hash){
			 for(var key2 in hash[key]){
				 hash[key][key2] = Object.keys( hash[key][key2]).length;
			 }
		 }
   ^^}$$
	 libFormat.hash2csv("static/stat/"+filename, hash);
   fn(null, fs.createReadStream("static/stat/"+filename));
 ^^for(var schema in stat.schemas){
 $$
 });
 ^^}$$

}
^^}$$
