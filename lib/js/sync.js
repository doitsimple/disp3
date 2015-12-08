module.exports.each = each;
//each([0,1,2],function(el,cb){}, function(err){})
function each(arr, fneach, fn){
	var runner = {arr: arr, fneach: fneach, fn: fn};
	runner.nexti = 0;
	eachSub(runner);
}
function eachSub(runner){
	if(runner.nexti == runner.arr.length){
		runner.fn();
		return;
	}
	runner.fneach(runner.arr[runner.nexti], function(err){
		runner.nexti++;
		if(!err)
			eachSub(runner);
		else
			runner.fn(err);
	});
}
//doEach([fun1,fun2,fun3], function(err){})
module.exports.doEach = doEach;
function doEach(fnarr, fn){
	var runner = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	doEachSub(runner, fn);
}
function doEachSub(runner, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func(function(err, result){
		if(err){
			fn(err, runner.nexti);
			return;
		}
		runner.nexti += 1;
		doEachSub(runner, fn);
	});
}

// env = {}
// fun* = function(env){}
//doEach2([fun1,fun2,fun3], env, function(err, env){})
//doEach2([fun1,fun2,fun3], function(err, env){})
module.exports.doEach2 = doEach2;
function doEach2(fnarr, param1, param2){
	var runner = {};
	var global;
	var fn;
	if(!param2){
		fn = param1;
		global = {};
	}else{
		fn = param2;
		global = param1;
	}
	runner.nexti = 0;
	runner.fnarr = fnarr;
	doEachSub2(runner, global, fn);
}
function doEachSub2(runner, global, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null, global);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func(global, function(err, result){
		if(err){
			fn(err, runner.nexti);
			return;
		}
		runner.nexti += 1;
		doEachSub2(runner, global, fn);
	});
}
//doEach3([fun1,fun2,fun3], self, function(err, i){})
module.exports.doEach3 = doEach3;
function doEach3(fnarr, self, fn){
	var runner = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	doEachSub3(runner, self, fn);
}
function doEachSub3(runner, self, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null, self);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func.call(self, function(err, result){
		if(err){
			fn(err, runner.nexti);
			return;
		}
		runner.nexti += 1;
		doEachSub3(runner, self, fn);
	});
}
/*
doKey({
 a: {exec: function(){}},
 b: {exec: function(){}},
}, "exec", function(err, env){})
doKey([
 {exec: function(){}},
 {exec: function(){}},
], "exec", function(err, env){})
*/
module.exports.doKey = doKey;
function doKey(fnobj, keyname, fn){
	var funcs = [];
	for(var key in fnobj){
		var func = fnobj[key][keyname];
		if(typeof func == "function"){
			funcs.push(func);
		}
	}
	doEach(funcs, fn);
}


