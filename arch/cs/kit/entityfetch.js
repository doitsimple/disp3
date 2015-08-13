module.exports = function(params, env, addRole, fn){
	var name = params.name;
	var apiJson = {};
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
	var schemaJson = {};
	schemaJson[name] = {
		"text": params.text+"列表",
		"init": [],
		"fields": {
			"seq": {
				"text": "顺序",
				"type": "number"
			},
			"text":{
				"text": "内容文字",
				"type": "string"
			},
			"filename":{
				"text": "文件名",
				"type": "file",
				"path": "/static/" + name
			}
		}
	};
	addRole("apis", apiJson);
	addRole("schemas", schemaJson);
	addRole("maindb", {
		"withSchemas": [name]
	});
	addRole("bserver", {
		"statics": {
			"/static": "../static"
		},
		"withApis": [
			"upload" + name
		]
	});
	addRole("fserver", {
		"statics": {
			"/static": "../static"
		},
		"withApis": [
			"upload" + name
		]
	});
	fn();
}
