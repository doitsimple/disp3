module.exports = function(name, env, addRole, fn){
	var uijson = {};
	uijson[name] = {
    "text": "",
    "elements": {
      "main": {
        "text": " ",
        "type": "table",
        "api": "list" + name,
        "withSchema": name
      }
    }
  };
	var apijson = {};
	apijson["list" + name] = {
		"type": "post",
    "params": {
      "where": {},
      "op": {}
    },
    "controllers": [
      {
        "type": "db",
        "method": "bcolect",
        "db": name,
        "where": "where",
        "op": "op",
        "send": "result"
      }
    ]
	}
	addRole("uis", uijson);
	addRole("apis", apijson);
	addRole("bserver", {
		"withApis": ["list" + name]
	});
	addRole("bclient", {
		"withUis": [name]
	});
	fn();
}
