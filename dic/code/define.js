module.exports.desc = function(src){
	var self = this;
	for(var i in src){
		self.make.main.push(src[i]);
	}
}
