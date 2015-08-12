module.exports = function(params, env, addRole, fn){
	var name = params.name;
	var apiJson = {};
	apiJson["list"+name] = {
		"type": "post",
    "params": {
      "where": {},
      "op": {}
    },
    "text": "获取"+params.text + "列表",
    "controllers": [{
      "type": "db",
      "method": "bselect",
      "db": name,
      "where": "{}",
      "send": "result"
    }]
	}
	apiJson["upload"+name] = {
		"type": "post",
    "text": "上传"+params.text,
    "controllers": [{
      "type": "db",
      "method": "bselect",
      "db": name,
      "where": "{}",
      "send": "result"
    }]
	}
	addRole("apis", apiJson);
	addRole("bserver", {
		"withApis": [
			"list" + name
		]
	});
	addRole("fserver", {
		"withApis": [
			"list" + name
		]
	});
	fn();
}
