var assert = require('assert');
var fs = require('fs');
var libFile = require("../lib/nodejs/file");
var walk = require("../src/walk");
describe('walk.js', function() {
	it('function walk', function() {
		if(!fs.existsSync("tmptest"))
			fs.mkdirSync("tmptest");
		fs.writeFileSync("tmptest/%%main%filea", "^^=var1$$^^=body$$");
		fs.writeFileSync("tmptest/%%body%filea", "^^=var2$$");
		fs.writeFileSync("tmptest/%var1%filea", "^^=var2$$");
		var filelist = {};
		assert.equal(true, walk.walk("tmptest", ".", {
			"project": {target: "."},
			"var1": "a",
			"var2": "b"
		}, filelist));
		assert.equal(false, !filelist.filea);
		assert.equal(false, !filelist.filea.main);
		assert.equal(false, !filelist.filea.main[0]);
		assert.equal(false, !filelist.filea.body);
		assert.equal(false, !filelist.afilea);
		fs.unlinkSync("tmptest/%%main%filea");
		fs.unlinkSync("tmptest/%%body%filea");
		fs.unlinkSync("tmptest/%var1%filea");

		fs.rmdirSync("tmptest");
	});


});
