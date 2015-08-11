var stream = require('stream');
function readWrapper(fn){
	this = new stream.Writable();
	var data = "";
	this.on('data', function (chunk) {
		data += chunk;
	});
	this.on('error', function (e) {
		fn(e);
	});
	this.on('end',function(){
		try {
			data = JSON.parse(data);
		}catch(e){
			return fn(e);
		}
		fn(null, data);
	});
}
var exportJson = {
	readWrapper: readWrapper
};
module.exports = exportJson;
