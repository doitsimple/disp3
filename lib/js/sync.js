module.exports.eachSeries  = each;
module.exports.each = each;
//eachSeries([0,1,2],function(el,cb){}, function(err){})
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
module.exports.doKey = doKey;
module.exports.doKeySeries = doKey;
function doKey(fnobj, keyname, param1, param2){
	var funcs = [];
	for(var key in fnobj){
		var func = fnobj[key][keyname];
		if(typeof func === "function")
			funcs.push(func);
	}
	doEach(funcs, param1, param2);
}

module.exports.doEach = doEach;
module.exports.doEachSeries = doEach;
function doEach(fnarr, param1, param2){
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
	doEachSub(runner, global, fn);
}
function doEachSub(runner, global, fn){
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
		doEachSub(runner, global, fn);
	});
}
//sync hetero
module.exports.doAll = doAll;
module.exports.doEachNoEnv = doAll;
function doAll(fnarr, fn){
	var runner = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	doAllSub(runner, fn);
}
function doAllSub(runner, fn){
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
		doAllSub(runner, fn);
	});
}

//with errorcode and funcname, delegated
module.exports.doSync = doSync;
function doSync(fnarr, global, fn){
	console.log("doSync is depleted");
	var runner = {};
	if(!global) global = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	doSyncSub(runner, global, fn);
}
function doSyncSub(runner, global, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null, global);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func(global, function(err, result, errorCode){
		if(err){
			fn(err, result, errorCode, func.name);
			return;
		}
		runner.nexti += 1;
		doSyncSub(runner, global, fn);
	});
}
