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
		fs.writeFileSync("disp.filea", "^^=var1$$^^=var2$$");
		fs.writeFileSync("psid.var2", " var2file");
		assert.equal(1, tmpl.generate({
			"filea": {
				"main": "disp.filea"
			},
			"fileb": {
				"main": "disp.filea",
				"env": "parta"
			},
			"filec": {
				"main": "disp.filea",
				"var2": "psid.var2",
				"env": "parta"
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
		assert.equal("parta var2file", fs.readFileSync("filec").toString());

		fs.unlinkSync("disp.filea");
		fs.unlinkSync("psid.var2");
		fs.unlinkSync("filea");
		fs.unlinkSync("fileb");
		fs.unlinkSync("filec");
	});

});
