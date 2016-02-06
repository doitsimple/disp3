module.exports = {
	extendGlobal: {
		"arch": "bin"
	},
	flagLeaf: 1,
	parse: parse,
	format: {
	}
}
function parse(b, l, gl){
	for(var i in b.code){
		gl.entityL.stepA.push(b.code[i]);
	}
}
