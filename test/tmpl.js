var assert = require('assert');
var fs = require('fs');
var libFile = require("../lib/nodejs/file");
var tmpl = require("../src/tmpl");
describe('tmpl.js', function() {
	it('function render', function() {
		assert.equal("a likes b", tmpl.render("^^=var1$$ likes ^^=var2$$", {
			"var1": "a",
			"var2": "b"
		}));
	});
	it('function generate', function() {

		fs.writeFileSync("filea--main", "^^=var1$$^^=var2$$");
		fs.writeFileSync("filea--var2", "+this is from another file");
		assert.equal(true, tmpl.generate({
			"filea": {
				"main": ["filea--main"]
			},
			"fileb": {
				"main": ["filea--main"],
				"env": "parta"
			},
			"filec": {
				"main": ["filea--main"],
				"var2": ["filea--var2"],
				"env": "parta"
			},
			"filed": {
				"src": "filea--main"
			}
		}, {
			"var1": "global",
			"var2": "",
			"parta": {
				"var1": "parta",
				"var2": "var2"
			}
		}));

		assert.equal("global", fs.readFileSync("filea").toString());
		assert.equal("partavar2", fs.readFileSync("fileb").toString());
		assert.equal("partavar2+this is from another file", fs.readFileSync("filec").toString());
		assert.equal("^^=var1$$^^=var2$$", fs.readFileSync("filed").toString());

		fs.unlinkSync("filea--main");
		fs.unlinkSync("filea--var2");
		fs.unlinkSync("filea");
		fs.unlinkSync("fileb");
		fs.unlinkSync("filec");
		fs.unlinkSync("filed");
	});

});
