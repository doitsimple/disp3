var assert = require("assert");
var regex = /%([^%@]+)?(?:@([^%@]+))?(?:%([a-zA-Z0-9]+)?(?:@([^%@]+))?)?(?:%([^%]+))?%/;
function testStr(str, s1, s2, s3, s4, s5){
	var ms;	
	console.log(str);
	ms = str.match(regex);
	assert.equal(s1, ms[1]); //reference to globalEnv
	assert.equal(s2, ms[2]); //selection params
	assert.equal(s3, ms[3]); //insert env
	assert.equal(s4, ms[4]); //select template
	assert.equal(s5, ms[5]); //select from dir
}
function testnoStr(str){
}

testStr("signin%%@html%.html", undefined, undefined, undefined, "html");
testStr("%%", undefined, undefined, undefined);
testStr("xxxxxxxx%%asdfasdf", undefined, undefined, undefined);
testStr("%%%", undefined, undefined, undefined);
testStr("%%main%", undefined, undefined, "main");
testStr("abc%%main%ccc", undefined, undefined, "main");
testStr("%impl%main%", "impl", undefined, "main");
testStr("%~impl%main%", "~impl", undefined, "main");
testStr("xxx%impl%main%xxx", "impl", undefined, "main");
testStr("%impl@b,a%", "impl", "b,a", undefined);
testStr("%@b,a%", undefined, "b,a", undefined);

testStr("%%@tmp%", undefined, undefined, undefined, "tmp");
testStr("xx%%@tmp%xx", undefined, undefined, undefined, "tmp");
testStr("%%xxx@tmp%", undefined, undefined, "xxx", "tmp");
testStr("%yyy%xxx@tmp%", "yyy", undefined, "xxx", "tmp");
testStr("%yyy@xx%xxx@tmp%", "yyy", "xx", "xxx", "tmp");
testStr("%%%xx%", undefined, undefined, undefined, undefined, "xx");
testStr("%%@tmp%xx%", undefined, undefined, undefined, "tmp", "xx");

