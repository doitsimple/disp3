var readline = require('readline');
module.exports = {
	waitLine: waitLine,
	waitLine2: waitLine2,
	select: select
}
function waitLine(prompt, fn){
	if(!prompt) prompt = "";
	prompt += ">";

	var rl =readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question(prompt, function(answer) {
		rl.close();
		fn(answer);
	});
}
function waitLine2(prompt, criteria, fn){
	waitLine(prompt, function(ans){
		if(!criteria(ans)) waitLine2(prompt, criteria, fn);
		else fn(ans);
	});
}
function select(arr, fn){
	console.log(JSON.stringify(arr));
	if(!arr || !arr.length) fn(0);
	if(arr.length == 1) fn(arr[0]);
	else{
		console.log(arr);
		waitLine2("enter index [1]: ", function(ans){
			var ind = parseInt(ans);
			if(!ind) return false;
			return true;
		}, function(ind){
			fn(arr[ind]);
		});
	}
}
