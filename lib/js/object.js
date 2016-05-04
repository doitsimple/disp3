module.exports.lastkey = function(json){
	var tmp = Object.keys(json);
	return tmp[tmp.length-1];
}
module.exports.getname = function(json){
	return stringify(json).replace(/\{|\}|\$|name:[a-zA-Z0-9]+|\"/g,"").replace(/:|,/g,"-");
}
module.exports.leaf = function(str){
	var m = str.match(/([^\.]+)$/)
	return m[1];
}
module.exports.stem = function(str){
	var m = str.match(/^(.+)\.[^\.]+$/)
	return m[1];
}

module.exports.toarr = function(json, isintval){
	var arr = [];
	if(isintval)
		for(var key in json)
			arr.push({key: parseInt(key), val: json[key]});
	else
		for(var key in json)
			arr.push({key: key, val: json[key]});
	return arr;
}
module.exports.stringifySimple = stringifySimple;
function stringifySimple(obj) {
  return stringify(obj, function(k, v){
		if(k.match("pass")) 
			return "123";
    if(typeof v == "string" && v.length > 25)
      return "[~]";
		if(isArray(v))
			return "[Arr ~]";
		return v;
	})
}
//https://registry.npmjs.org/json-stringify-safe
module.exports.stringify = stringify;
function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}
function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }
  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)
    return replacer == null ? value : replacer.call(this, key, value)
  }
}


module.exports.mixin = mixin;
//node_modules merge-descriptors
function mixin(dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    var descriptor = Object.getOwnPropertyDescriptor(src, name)
    Object.defineProperty(dest, name, descriptor)
  })

  return dest
}

module.exports.revKey = revKey;
function revKey(obj){
  var robj = {};
  var keys = Object.keys(obj);
  for(var i = keys.length -1;i>=0; i--){
    robj[keys[i]] = obj[keys[i]];
  }
  return robj;
}
module.exports.extendWithKey = function(json, key){
	var keys = key.split(".");
	var jsonx = json;
	for(var i=0; i<keys.length; i++){
		var key2 = keys[i];
		if(!jsonx[key2]){
			jsonx[key2] = {};
		}
		jsonx = jsonx[key2];
	}
	return jsonx;
}
module.exports.forEnums = forEnums;
function forEnums(enums, env, fn){
	var envlist = getByKey(env, enums.from);
	enums.forEach(function(e){
		fn(envlist[e]);
	});
}
module.exports.getDeps = getDeps;
function getDeps(origin, depList, fn){
	var origins;
	if((origins = depList[origin]))
		_getDeps(origins, depList, fn);
	fn(origin);
}
function _getDeps(origins, depList, fn){
	origins.forEach(function(origin){
		getDeps(origin, depList, fn);
	});
}
module.exports.setIfEmpty = setIfEmpty;
function setIfEmpty(obj, key, val){
	if(!obj[key])
		obj[key] = val;
}
module.exports.concat = 
function concat(){
	var rtn;
	var arg1 = arguments[0];
	if(isArray(arg1))
		rtn = arg1;
	else if(arg1 !==null && arg1!==undefined && arg1 !== "")
		rtn = [arg1];
	else
		rtn = [];
	for(var i = 1; i< arguments.length; i++){
		var arg2 = arguments[i];
		if(i == 0) return;
		if(isArray(arg2))
			rtn = rtn.concat(arg2);
		else if(arg2 !==null && arg2!==undefined && arg2 !== "")
			rtn.push(arg2);
	};
	return rtn;
}
module.exports.getByKey = getByKey;
function getByKey(obj, key){
	var rtn = obj;
	var keys = key.split(".");

	for(var i=0; i<keys.length; i++){
		if(!keys[i]) continue;
		if(!rtn) return null;
		rtn = rtn[keys[i]];
	}
	return rtn;
}
module.exports.getsByKey = getsByKey;
function getsByKey(obj, key){
	var keys = key.split(".");
	var arr = [];
	var objs;
	if(!isArray(obj)){
		objs = [obj];
	}else{
		objs = obj;
	}
	for(var oi=0; oi<objs.length; oi++){
		var subobj = objs[oi];
		var rtn = subobj;
		for(var i=0; i<keys.length; i++){
			if(!keys[i]) continue;
			if(!rtn) return null;
			if(keys[i] == "*"){
				for(var subkey in rtn){
					var subkeystr = "";
					for(var j=i+1; j<keys.length; j++){
						subkeystr += "." + keys[j];
					}
					var subarr = getsByKey(rtn[subkey], subkeystr);
					if(!isArray(subarr)) continue;
					if(subarr.length)
						subarr.forEach(function(e){
							arr.push(e);
						});
				}
			}else{
				rtn = rtn[keys[i]];
			}
		}
	}
	if(!arr.length && !isEmpty(rtn)) arr.push(rtn);
	return arr;
}
module.exports.isArray = isArray;
function isArray(obj){
	if(Object.prototype.toString.call( obj ) === '[object Array]')
		return 1;
	if(typeof obj === "object" && Object.keys(obj)[0] === '0')
		return 1;
	return 0;
}
module.exports.isBuffer = isBuffer;
function isBuffer(obj){
	return obj.constructor.name == "Buffer";
}
module.exports.isEmpty = isEmpty;
function isEmpty(obj){
	if(!obj || typeof obj != "object") return true;
	if(Object.keys(obj).length == 0) return true;
	return false;
}
module.exports.copy = copy;
function copy(obj){
	var rtn;
	if(typeof obj != "object")
		return obj;
	if(isArray(obj)) rtn = [];
	else rtn = {};
	extend(rtn, obj);
	return rtn;
}
module.exports.copy1 = copy1;
function copy1(obj)
//copy obj
{
	var rtnObj = {};
	if(obj)
		for(var key in obj)
			rtnObj[key] = obj[key];
	return rtnObj;
}

module.exports.extend = extend;
function extend(config, config2){
	if(!config) {config = config2; return; }
	iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
		itConfig2[key] = itConfig[key];
/*
		itConfig[key].forEach(function(v){
			pushIfNotExists(itConfig2[key], v);
		});
*/
	});
}

module.exports.extend1 = extend1;
function extend1(targetObj, obj)
//extend first level
{
	if(!targetObj) targetObj = {};
	if(obj)
		for(var key in obj)
			if(obj[key] != undefined || obj[key] != null)
				targetObj[key] = obj[key];
	return targetObj;
}

function append1(targetObj, obj)
//extend first level
{
	if(!targetObj) targetObj = {};
	if(obj)
		for(var key in obj){
			if(!targetObj.hasOwnProperty(key)){
				targetObj[key] = obj[key];
			}
		}
	return targetObj;
}
module.exports.append = append;
function append(config, config2){
	if(!config) {config = config2; return; }
	iterate2(config2, config, function(key, itConfig, itConfig2){
		if(!itConfig2.hasOwnProperty(key)) itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
		if(!itConfig2.hasOwnProperty(key) || !itConfig2[key].length) itConfig2[key] = itConfig[key];
	});
}
module.exports.append1 = append1;
function _each_(obj, fn){
	if(obj == undefined || obj == null) return;
	if(typeof obj == "object"){
		if(isArray(obj)){
			obj.forEach(function(o){
				fn(o);
			});
		}
		else{
			for(var key in obj){
				fn(key);
			}
		}
	}else{
		fn(obj);
	}
}
module.exports.each = _each_;

function iterate(config, fnBasic, fnArray){
	for (var key in config){
		if(typeof config[key] == "object"){
			if(isArray(config[key])){
				if(fnArray) fnArray(key, config);
				else {
					config[key].forEach(function(e, i){
						if(typeof(e) == "object"){
							iterate(e, fnBasic);
						}else{
							fnBasic(key, config, i);
						}
					});
				}
			}else{
				iterate(config[key], fnBasic, fnArray);
			}
		}else{
			fnBasic(key, config);
		}
	}
}
module.exports.iterate = iterate;

function iterate2(config, config2, fnBasic, fnArray){
	if(config2 == undefined) config2 = {};
	if(typeof config2 != "object") return;
	for (var key in config){
		if(typeof config[key] == "object"){
			if(isArray(config[key])){
				fnArray(key, config, config2);
			}else{
				if(!config2[key]) config2[key] = {};
				iterate2(config[key], config2[key], fnBasic, fnArray);
			}
		}else{
			fnBasic(key, config, config2);
		}
	}
}
module.exports.iterate2 = iterate2;
module.exports.forBySeq = forBySeq;
function forBySeq(obj, fn){
	var tmp = sortByKey(obj, function(a, b){
		if(!obj[b].seq) return false;
		if(!obj[a].seq) return true;
		return obj[a].seq > obj[b].seq;
	});
	for(var key in tmp){
		fn(key, obj[key]);
	}	
}


function sortByKey(o, sortfn){
	var sorted = {},
			key, a = [];

  for (key in o) {
		if (o.hasOwnProperty(key)) {
			a.push(key);
		}
  }

	if(sortfn) a.sort(sortfn);
	else a.sort();

  for (key = 0; key < a.length; key++) {
		sorted[a[key]] = o[a[key]];
  }
  return sorted;
}
module.exports.sortByKey = sortByKey;

function _sort_(obj, sortfn){
	var sorted = {};
	var sortable = [];
	for (var key in obj)
    sortable.push({key: key, value: obj[key]});
	if(!sortfn){
		if(sortfn == "inc")
			sortfn = function(a, b){
				if(a.value == b.value) return a.key.localeCompare(b.key);
				return b.value - a.value;
			};
		else if(sortfn == "dec")
			sortfn = function(a, b){
				if(a.value == b.value) return a.key.localeCompare(b.key);
				return a.value - b.value;
			};
		else
			sortfn = function(a, b){
				if(a.value == b.value) return a.key.localeCompare(b.key);
				return a.value.localeCompare(b.value);
			};
	}
	sortable.sort(sortfn);
	sortable.forEach(function(e){
		sorted[e.key] = e.value;
	});
	return sorted;
};
module.exports.sort = _sort_;

function clear(obj){
	for(var key in obj){
		if(typeof obj[key] == "object"){
			clear(obj[key]);	
		}
		delete obj[key];
	}
}
module.exports.clear = clear;
function _for_(obj, fn){
	var keys = Object.keys(obj);
	for(var i=0; i<keys.length; i++){
		if(i == keys.length-1) fn(keys[i], obj[keys[i]], true);
		else fn(keys[i], obj[keys[i]]);
	}
}
module.exports.for = _for_;
