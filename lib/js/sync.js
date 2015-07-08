module.exports.eachSeries = eachSeries;
function eachSeries(arr, fneach, fn){
	var runner = {arr: arr, fneach: fneach, fn: fn};
	runner.nexti = 0;
	eachSeriesSub(runner);
}
function eachSeriesSub(runner){
	if(runner.nexti == runner.arr.length){
		runner.fn();
		return;
	}
	runner.fneach(runner.arr[runner.nexti], function(err){
		runner.nexti++;
		if(!err)
			eachSeriesSub(runner);
		else
			runner.fn(err);
	});

}

//sync hetero
module.exports.doEachSeries = doEachSeries;
function doEachSeries(fnarr, param1, param2){
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
	doEachSeriesSub(runner, global, fn);
}
function doEachSeriesSub(runner, global, fn){
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
		doEachSeriesSub(runner, global, fn);
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
