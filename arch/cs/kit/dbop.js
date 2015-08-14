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
    }],
		"midwares": ["auth"]
	}
	apiJson["add"+name] = {
		"type": "post",
    "params": {
    },
    "text": "添加"+params.text,
    "controllers": [{
      "type": "db",
      "method": "insert",
			"doc": "req.body",
      "db": name,
      "send": "result"
    }],
		"midwares": ["auth"]
	}
	apiJson["modify"+name] = {
		"type": "post",
    "params": {
			"_id": {"required": true}
    },
    "text": "修改"+params.text,
    "controllers": [{
      "type": "db",
      "method": "update",
			"where": "{_id: coreDb.ObjectId(_id)}",
			"set": "req.body",
      "db": name,
      "send": "result"
    }],
		"midwares": ["auth"]
	}
	apiJson["delete"+name] = {
		"type": "post",
    "params": {
			"_id": {"required": true}
    },
    "text": "删除"+params.text,
    "controllers": [{
      "type": "db",
      "method": "delete",
      "db": name,
      "where": "{_id: coreDb.ObjectId(_id)}",
      "send": "result"
    }],
		"midwares": ["auth"]
	}
	addRole("apis", apiJson);
	addRole("bserver", {
		"withApis": [
			"list" + name,
			"add" + name,
			"modify" + name,
			"delete" + name
		]
	});
	fn();
}
