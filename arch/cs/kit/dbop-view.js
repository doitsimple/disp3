module.exports = function(params, env, addRole, fn) {
	var name = params.name;
	var schemajson = {};
	schemajson[name] = {
		"text": "[" + name + "]",
		"fields": {
			"_id": {
				"text": "ID",
				"type": "ObjectId",
        "ondemand":true
			}
		}
	}

	//ui
	var uijson = {};
	uijson["opt-" + name] = {
		"text": params.text,
		"elements": {
			"main": {
				"text": params.text,
				"type": "table",
				"api": "bcolect" + name,
				"withSchema": name,
				"opt": {
					"add": {},
					"update": {},
					"delete": {}
				}
			}
		}
	};
	//api
	var apiJson = {};
	apiJson["bcolect" + name] = {
		"type": "post",
		"params": {
			"where": {},
			"op": {}
		},
		"text": "获取" + params.text + "列表",
		"controllers": [{
			"type": "db",
			"method": "bcolect",
			"db": name,
			"where": "where",
			"op": "op",
			"send": "result"
		}],
		"midwares": ["auth"]
	}
	addRole("schemas", schemajson);
	addRole("apis", apiJson);
	addRole("uis", uijson);
	addRole("bserver", {
		"withApis": [
			"bcolect" + name
		]
	});
	addRole("bclient", {
		"withUis": ["opt-" + name],
		"navbar": {
			"test": {
				"text": "默认",
				"icon": "refresh",
				"subs": {
					"default": {
						"href": "#/opt-" + name,
						"text": "默认"
					}
				}
			}
		}
	});
	fn();
}