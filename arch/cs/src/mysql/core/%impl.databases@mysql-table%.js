var mysqldb = require("mysql");
var mysqlConnection;
var log = require("./log");
var sync = require("../lib/sync");
var libDate = require("../lib/date");
var schemas = ^^= require("util").inspect(global.proto.schemas, false, 10) $$;
module.exports = function(dbnameMap, genModelFuncList, connectFuncs) {
	/*^^for(var si=0; si<withSchemas.length;si++){$$*/
	dbnameMap["^^=withSchemas[si]$$"] = "^^=name$$";
	/*^^}$$*/
	genModelFuncList["^^=name$$"] = getModel;
	genModelFuncList["mysql"] = getModel;
	connectFuncs.push(connect);
	return {
		ObjectId: function(id) {
			return id;
		}
	}
}

module.exports.getModel = getModel;

function getModel(table) {
	var model = {
		"table": table
	};
	model.insert = function(doc, fn) {
		if (!doc) return fn("no doc");
		execute(getInsertStr(doc, model.table), function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"insertedId": result.insertId
			});
		});
	};
	//fn: function(err, result)
	//result: {insertedId: "abcdedf"}
	model.update = function(where, doc, fn) { //update one
		var upereSql = getUpdateStr(where, doc, model.table);
		var idField = schemas[model.table].idField;
		upereSql += (idField ? " ORDER BY " + idField + " DESC" : "") + " LIMIT 1";
		execute(upereSql, function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"n": result.affectedRows
			});
		});
	};
	//fn: function(err, result)
	//result: {n: 1}
	model.select = function(where, col, fn) {
		if (typeof where == "string" || typeof where == "number") {
			//idField default as _id
			var val = where;
			where = {};
			if (schemas[model.table]["idField"]) {
				where[schemas[model.table]["idField"]] = val;
			} else if (schemas[model.table][0]) {
				where[schemas[model.table][0]] = val;
			} else {
				where["_id"] = val;
			}
		}
		execute(getSelectStr(where, col, model.table) + " LIMIT 1", function(err,result){
			if(err){
				fn(err);
				return;
			}
			fn(null, result.length ? result[0] : null);
		});
	};
	//fn: function(err, result)
	//result: doc
	model.delete = function(where, fn) {
		var deereSql = getDeleteStr(where, model.table);
		var idField = schemas[model.table].idField;
		deereSql += (idField ? " ORDER BY " + idField + " DESC" : "") + " LIMIT 1";
		execute(deereSql, function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"n": result.affectedRows
			});
		});
	};
	//fn: function(err, result)
	//result: {n: 1}
	model.bdelete = function(where, fn) {
		execute(getDeleteStr(where, model.table), function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"n": result.affectedRows
			});
		});
	};
	//fn: function(err, result)
	//result: {n: n}
	model.binsert = function(docs, fn) {
		if (!docs) return fn("no docs");
		execute(getInsertsStr(docs, model.table), function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"n": result.affectedRows
			});
		});
	};
	//fn: function(err, result)
	//result: {n: 10}
	model.bupdate = function(where, doc, fn) {
		execute(getUpdateStr(where, doc, model.table), function(err, result) {
			if (err) {
				fn(err);
				return;
			}
			fn(null, {
				"n": result.affectedRows
			});
		});
	};
	model.bselect = function(where, col, fn) {
		var $sort, limit, skip, key;
		if (where.$sort) {
			$sort = where.$sort;
			delete where.$sort;
		}
		if (where.skip) {
			skip = where.skip;
			delete where.skip;
		}
		if (where.limit) {
			limit = where.limit;
			delete where.limit;
		}
		var selectStr = getSelectStr(where, col, model.table);
		if ($sort) {
			var $sorts = [];
			for (key in $sort) {
				if ($sort[key] == -1)
					$sorts.push(key + " DESC");
				else
					$sorts.push(key + " ASC");
			}
			selectStr += " ORDER BY " + $sorts.join(", ");
		}
		if (limit) {
			selectStr += " LIMIT " + limit;
			if (skip) {
				selectStr += ", " + skip;
			}
		}
		if (skip && !limit)
			console.error("skip must be used with limit for mysql");
		execute(selectStr, fn);
	};
	model.drop = function(fn) {
		execute("DROP TABLE " + model.table, fn);
	};
	return model;
}

function execute(executable, fn) {
	if (executable) {
		mysqlConnection.query(executable, function(err, results) {
			if (err) {
				console.error("execute['" + executable + "']failed\n" + err.toString() + "\n");
				fn(err);
			} else {
				fn(null, results);
			}
		});
	} else {
		fn("no executable!");
	}

}

function getInsertStr(json, table) {
	var cols = [];
	for (var key in json) {
		cols.push(key);
	}
	return "INSERT INTO " + table + "(" + cols.join(", ") + ") VALUES " + genInsertedValuesStr(json, table, false);
}

function getInsertsFields(table){
	var fields = [];
	for(var field in schemas[table].fields){
		if(!schemas[table].fields[field].autoinc){
			fields.push(field);
		}
	}
	return fields;
}
function getInsertsStr(jsonArr, table) {
	var values = [];
	for (var i in jsonArr) {
		values.push(genInsertedValuesStr(jsonArr[i], table, true));
	}
	var fields = schemas[table].fields;
	return "INSERT INTO " + table + "(" + getInsertsFields(table).join(", ") + ") VALUES " + values.join(", ");
}

function getSelectStr(where, coljson, table) {
	var colStr, key;
	var cols = [];
	for (key in coljson) cols.push(key);
	colStr = cols.join(", ");
	if (!colStr) colStr = "*";
	var str = "SELECT " + colStr + " FROM " + table;
	if (where && Object.keys(where).length)
		str += " WHERE " + genEqualStr(where);
	return str;
}

function getUpdateStr(where, doc, table) {
	var incstr = "";
	if (doc.$inc) {
		for (var key in doc.$inc) {
			incstr += (", " + key + " = " + key + " + " + doc.$inc[key]);
		}
		delete doc.$inc;
	}
	var str = "UPDATE " + table + " SET ";
	var setStr = genEqualStr(doc, ", ");
	if (incstr) {
		if (!setStr)
			str += incstr.substr(1);
		else
			str += (setStr + incstr);
	} else {
		str += setStr;
	}
	if (where && Object.keys(where).length)
		str += " WHERE " + genEqualStr(where);
	return str;
}

function getDeleteStr(where, table) {
	var str = "DELETE FROM " + table;
	if (where && Object.keys(where).length)
		str += " WHERE " + genEqualStr(where);
	return str;
}


function genInsertedValuesStr(json, table, isAllField) {
	var values = [];
	if (isAllField) {
		var fieldArr = getInsertsFields(table);
		for (var i in fieldArr) {
			var field = fieldArr[i];
			if (json.hasOwnProperty(field)) {
				switch (typeof json[field]) {
					case "string":
						values.push("'" + json[field] + "'");
						break;
					case "object":
					//str_to_date
						values.push("timestamp('"+libDate.formatDate(json[field], "yyyy-M-d h:m:s")+"')");
						break;
					default:
						values.push(json[field]);
				}
			} else {
				var nofield = schemas[table].fields[field];
				if (nofield.hasOwnProperty("default")) {
					var def = nofield["default"];
					if (typeof def == "string") {
						if (nofield.type == "date") { //date value
							values.push("NOW()");
						} else if (nofield.type == 'string') {
							values.push("'" + def + "'");
						} else {
							values.push(def);
						}
					} else { // int value of the field
						values.push(json[field]);
					}
				} else { //no
					values.push("null");
				}
			}
		}
	} else {
		for (var field in json) {
			switch (typeof json[field]) {
				case "string":
					values.push("'" + json[field] + "'");
					break;
				case "object":
					values.push("timestamp('"+libDate.formatDate(json[field], "yyyy-M-d h:m:s")+"')");
					break;
				default:
					values.push(json[field]);
			}
		}
	}
	return "(" + values.join(", ") + ")";
}

function genEqualStr(where, sep) {
	if (!sep) sep = " and ";
	var whereStr, key;
	if (!where)
		whereStr = "";
	else {
		var wheres = [];
		for (key in where) {
			switch (typeof where[key]) {
				case "string":
					wheres.push(key + " = " + "'" + where[key] + "'");
					break;
				case "object":
					wheres.push(key + " = " + "timestamp('"+libDate.formatDate(where[key], "yyyy-M-d h:m:s")+"')");
					break;
				default:
					wheres.push(key + " = " + where[key]);
			}
		}
		whereStr = wheres.join(sep);
	}
	return whereStr;
}

function connect(env, fn) {
	var str = "^^=host$$";
	var host_tmp = str.split(":");
	var host = host_tmp[0];
	var port_tmp = host_tmp[1].split("/")
	var port = parseInt(port_tmp[0]);
	var db = port_tmp[1];
	if (!mysqlConnection) {
		module.exports.client = mysqlConnection = mysqldb.createConnection({
			host: host,
			port: port,
			database: db,
			user: '^^=user$$',
			password: '^^=password$$'
		});
		mysqlConnection.connect(function(err) {
			if (err) {
				if (err.code == 'ER_BAD_DB_ERROR' && err.errno == 1049 && err.sqlState == '42000') {
					console.log("no database{^^=db$$}, create it now!");
					var conn = mysqldb.createConnection({
						host: host,
						port: port,
						database: 'mysql',
						user: '^^=user$$',
						password: '^^=password$$'
					});
					conn.connect(function(err) {
						if (err) {
							fn("use default database[mysql] err!");
							return;
						}
						conn.query("create databases ^^=db$$", function(err) {
							if (err) {
								fn(err);
								return;
							}
							mysqlConnection.connect(function(err) {
								fn(err);
							});
						});
					});
				}
				fn(err);
				return;
			}
			var executableSqls = []; ^^
			if (global.proto.schemas) {
				for (var name in global.proto.schemas) {
					var fields = global.proto.schemas[name].fields;
					var idField = global.proto.schemas[name].idField;
					$$
					var createTableStr = "CREATE TABLE IF NOT EXISTS ^^=name$$ ("; ^^
					var i = 0;
					var len = Object.keys(fields).length;
					for (var fieldName in fields) {
						i++;
						var f = fields[fieldName];
						$$
						createTableStr += '^^=f.name$$'; ^^
						if (f.type == "int") {
							$$
							createTableStr += " BIGINT"; ^^
						} else if(f.type == "date"){
							$$
							createTableStr += " TIMESTAMP";^^
						} else {
							$$
							createTableStr += " VARCHAR(255)"; ^^
						}
						$$
							^^
							if (f.name == idField) {
								$$
								createTableStr += " PRIMARY KEY"; ^^
							}
						$$
							^^
							if (f.default == "autoinc" || f.autoinc) {
								$$
								createTableStr += " AUTO_INCREMENT"; ^^
							}
						$$
							^^
							if (f.default == "now") {
								$$
								createTableStr += " DEFAULT NOW()"; ^^
							}
						$$
							^^
							if (f.unique) {
								$$
								createTableStr += " UNIQUE"; ^^
							}
						$$
							^^
							if (f.required) {
								$$
								createTableStr += " NOT NULL"; ^^
							}
						$$
							^^
							if (i != len) {
								$$
								createTableStr += ", "; ^^
							}
						$$
							^^
					}
					$$
					createTableStr += ");";
					executableSqls[executableSqls.length] = createTableStr; ^^
				}
			}
			$$
			sync.eachSeries(executableSqls, execute, function(err, result) {
				console.log(result);
				fn(err);
			});
		});
	} else {
		fn(null);
	}
};