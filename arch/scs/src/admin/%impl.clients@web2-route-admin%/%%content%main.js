rootApp.factory('access', function(req, auth){
	var methods = {};
	methods.delete = function(schema, _id){
		req.postBearer("/api/access/"+schema+"/delete", auth.gettoken(), {_id: _id}, function(err){
			if(!err) alert("success");
		});
	}
	methods.get = function(schema, _id){
		req.postBearer("/api/access/"+schema+"/select", auth.gettoken(), {_id: _id}, function(err){
			if(!err) alert("success");
		});
	}
	methods.put = function(schema, _id, json){
		req.postBearer("/api/access/"+schema+"/delete", auth.gettoken(), {_id: _id}, function(err){
			if(!err) alert("success");
		});
	}
	methods.add = function(schema, json){
		req.postBearer("/api/access/"+schema+"/insert", auth.gettoken(), json, function(err){
			if(!err) alert("success");
		});
	}
	methods.export = function(schema, _id){
		req.postBearer("/api/access/"+schema+"/delete", auth.gettoken(), {_id: _id}, function(err){
			if(!err) alert("success");
		});
	}
	return methods;
});
