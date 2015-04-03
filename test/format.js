var assert = require('assert');
var fs = require('fs');
var libFile = require("../lib/nodejs/file");
var format = require("../src/format");
describe('format.js', function() {
	it('function checkFormat', function() {
		assert.equal(1, format.checkFormat({
			a: 1,
			b: "ss",
			c: "x"
		},{
			"a": "number",
			"b": "string",
			"c": {
				"type": "enum",
				"value": ["x", "y", "z"]
			}
		}));
	});
	it('function checkKit mono', function() {
		assert.equal(1, format.checkKit({
			"a": 1
		},{
			"kit": "mono",
			"format": {
				"a": "number"
			}			
		}));
	});
	it('function checkKit list', function() {
		assert.equal(1, format.checkKit({
			"name1": {
				"a": 1
			},
			"name2": {
				"a": 2
			}
		},{
			"kit": "list",
			"format": {
				"a": "number"
			}			
		}));
	});
	it('function checkKit embeded', function() {
		assert.equal(1, format.checkKit({
			"a": 1,
			"b": {
				"name1": {
					"a": "xxx"
				},
				"name2": {
					"a": "YYY"
				}
			}
		},{
			"kit": "mono",
			"format": {
				"a": "number",
				"b": {
					"kit": "list",
					"format": {
						"a": "string"
					}
				}
			}			
		}));
	});
	it('function readAndCheckConfig', function(){
		assert.equal(false, !format.readAndCheckConfig("example"));
	});
});
