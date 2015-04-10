var assert = require('assert');
var fs = require('fs');
var path = require("path");
var libFile = require("../lib/nodejs/file");
var format = require("../src/format");
var log = require("../src/log");
var root = path.resolve(__dirname + "/..");
describe('format.js', function() {
	before(function(){
		log.setLevel(0);
	});
	it('function checkFormat', function() {
		assert.equal(true, format.checkFormat({
			a: 1,
			b: "ss",
			c: "x"
		},{
			"a": "number",
			"b": "string",
			"c": {
				"type": "enum",
				"sets": ["x", "y", "z"]
			}
		}));
		assert.equal(false, format.checkFormat({
			a: 1,
			b: "ss",
			c: "xx"
		},{
			"a": "number",
			"b": "string",
			"c": {
				"type": "enum",
				"sets": ["x", "y", "z"]
			}
		}));
	});
	it('function checkFormat with env', function() {
		assert.equal(true, format.checkFormat({
			a: "b",
			b: "b"
		},{
			"a": {
				"type": "enum",
				"from": "alist"
			},
			"b": {
				"type": "enums",
				"from": "alist"
			}
		},{
			"alist": {
				"b": true,
				"c": true
			}
		}));
		assert.equal(false, format.checkFormat({
			a: "b"
		},{
			"a": {
				"type": "enum",
				"from": "alist"
			}
		},{
			"alist": {
				"c": true
			}
		}));
		assert.equal(false, format.checkFormat({
			a: "b"
		},{
			"a": {
				"type": "enums",
				"from": "alist"
			}
		},{
			"alist": {
				"c": true
			}
		}));
	});
	it('function checkKit mono', function() {
		assert.equal(true, format.checkKit({
			"a": 1
		},{
			"kit": "mono",
			"format": {
				"a": "number"
			}			
		}));
	});
	it('function checkKit list', function() {
		assert.equal(true, format.checkKit({
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
		assert.equal(true, format.checkKit({
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
		assert.equal(false, !format.readAndCheckConfig("example", root));
	});
});
