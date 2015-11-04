var auth = ^^=auth$$;
var db = require("../db");
var log = require("../lib/log");
var clients = {};
var interServerAddrs = ^^=$.stringify(servers)$$ || {};

//用户在线补发离线消息时 data._id 存在
function sendMsg(params) {
	if(!params.type) params.type = 1;
	var userid = params.userid;
	var Bridge = db.getModel("bridges");
	if (!userid) return;
	var Msg = db.getModel("messages");

//服务器端人工回复消息时 params.replyuser为工作人员的id
	if (params._id && params.replyuser) {
		Bridge.update({
			"userid": userid
		}, {
			update_time: new Date(),
			update_user: params.replyuser
		});
	}
	var success = false;
	//online 尝试在线发送
	var sendJson = {};
	if(params.message) sendJson.message = params.message;
	if(params.needCaptcha) sendJson.needCaptcha = params.needCaptcha;
	if(params.updateUser) sendJson.updateUser = params.updateUser;
	if(params.goto) sendJson.goto = params.goto;
	if(params.next) sendJson.next = params.next;
	if(clients[userid]){
		var client = clients[userid];
		try {
			client.write(JSON.stringify(sendJson) + "\n");
			success = true;
		} catch (err) {
			log.e("err on connection closed user: " + userid + " " + params.message);
			log.e(err);
		}
	}
	log.i("send "+ userid + " " + JSON.stringify(sendJson) + ""
				+ (success?"sync":"async"));
	if(params._id) {
		if(success){
			params.status = 2;
			params.time = new Date();
		}else{
			params.status = 1;
		}
		Msg.insert(params);
	}else{
		if(success)
			Msg.update({_id: params._id}, {
				status: 2,
				time: new Date()
			});
	}
}
module.exports.connection = connection;
function connection(client) {
//如果是来自server的连接
	if (interServerAddrs[client.remoteAddress]) {
		client.on("data", function(params) {
			try {
				params = JSON.parse(params);
			} catch (err) {
				log.e("internal server send msg error "+params);
				return;
			}
			sendMsg(params, true);
		});
		client.on("error", parseError);
		client.on("close", function() {
			client.destroy();
		});
//默认为来自app的连接
	} else {
		client.on("data", function(params) {
			try {
				params = JSON.parse(params);
			} catch (err) {
				return;
			}
			switch (params.action) {
				case "conn":
					firstConnect(client, params);
					break;
				case "msg":
					receiveMsg(client, params);
					break;
			}
		});
		client.on("error", parseError);
		client.on("close", function() {
			connectionClose(client);
		});
	}
};

function connectionClose(client) {
	if (!client.user) return client.destroy();
	if (clients[client.user._id]) {
		var c = clients[client.user._id];
		log.i("user: " + c.user._id + " " + c.user.realname + " closed connection!!");
		delete clients[client.user._id];
	}
	client.destroy();
}

function parseError(err){
	log.e(err);
}

function firstConnect(client, params) {
	if(!params.token)
		return;
	auth(params.token, function(err, user) {
		if (err || !user) {
			client.destroy();
			return;
		}
		var userid = user._id;
		if (clients[user._id])
			clients[user._id].destroy();
		clients[user._id] = client;
		client.user = {
			_id: user._id,
			realname: user.realname,
			phone: user.phone
		};
		log.i("user: "+userid +" "+user.realname+ " connected at " + client.remoteAddress);
		sendNoneReceivedMsg(userid);
	})
}

function sendNoneReceivedMsg(userid) {
	var Msg = db.getModel("messages");
	Msg.bselect({
		userid: userid,
		status: 1,
		type: 1
	}, function(err, msgs) {
		if (err) return console.error(err);
		for (var i in msgs) {
			sendMsg(msgs[i]);
		}
	});
}

function receiveMsg(client, params) {
	if(!params.message){
		log.e(params);
		return;
	}
	if(!client.user){
		log.e("not authorised");
		return;
	}
	var user = client.user;
	var bridgeObj = {
		"userid": user._id,
		"phone": user.phone,
		"realname": user.realname,
		"msg": params.message,
		"last_time": new Date(),
		"reply": 1
	};
	var messageObj = {
		"time": new Date(),
		"userid": user._id,
		"status": 1,
		"type": 2,
		"message": params.message
	};
	var Msg = db.getModel("messages");
	var Bridge = db.getModel("bridges");
	Msg.insert(messageObj, function(err, result) {
		if (err) return log.e(err);
		Bridge.upsert({
			"userid": user._id
		}, bridgeObj, function(err, result) {
			if(err) return log.e(err);
		});
	});
}
