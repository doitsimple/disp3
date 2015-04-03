var readline = require('readline');
module.exports.waitLine = waitLine;
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
