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
module.exports.getByKey = getByKey;
function getByKey(obj, key){
	var rtn = obj;
	var keys = key.split(".");

	for(var i=0; i<keys.length; i++){
		if(!keys[i]) continue;
		if(rtn)
			rtn = rtn[keys[i]];
	}
	return rtn;
}
module.exports.isArray = isArray;
function isArray(obj){
	return Object.prototype.toString.call( obj ) === '[object Array]';
}
module.exports.isBuffer = isBuffer;
function isBuffer(obj){
	return obj.constructor.name == "Buffer";
}
module.exports.isEmpty = isEmpty;
function isEmpty(obj){
	if(!obj) return true;
	if(Object.keys(obj).length == 0) return true;
	return false;
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
		itConfig[key].forEach(function(v){
			itConfig2[key].push(v);
		});
	});
}

module.exports.extend1 = extend1;
function extend1(targetObj, obj)
//extend first level
{
	if(!targetObj) targetObj = {};
	if(obj)
		for(var key in obj)
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
	
	if(!config2) config2 = {};
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
