module.exports = {
	parse: parse,
	flagLeaf: 1
}
function parse(b, l, gl, $){
	if(!gl.config) gl.config = {};
	$.extend(gl.config, b);
}
