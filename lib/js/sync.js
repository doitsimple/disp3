

module.exports.sync = sync;
function sync(fnarr, global, fn){
	var runner = {};
	if(!fn){
		if(typeof global == "function") fn = global;
		else fn=function(){};
		global = {};
	}
	else if(!global) global = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	syncSub(runner, global, fn);
}
function syncSub(runner, global, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null, global);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func(global, function(err, result, errorCode){
		if(err){
			fn(err, runner.nexti);
			return;
		}
		runner.nexti += 1;
		doSyncSub(runner, global, fn);
	});
}
module.exports.doSync = doSync;
function doSync(fnarr, global, fn){
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
