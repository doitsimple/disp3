module.exports.formatDate = formatDate;

function formatDate(date, fmt) {
	//author: meizz
	var o = {
		"M+": date.getMonth() + 1, //月份
		"d+": date.getDate(), //日
		"h+": date.getHours(), //小时
		"m+": date.getMinutes(), //分
		"s+": date.getSeconds(), //秒
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度
		"S": date.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

module.exports.getDate = getDate;
function getDate(date) {
	if(!date || date == "Invalid Date") return "";
	var str = "";
	str += date.getFullYear().toString();
	str += formatTwoDigit(date.getMonth() + 1);
	str += formatTwoDigit(date.getDate());
	return str;
}
module.exports.getDatetime = getDatetime;
function getDatetime(date) {
	if(!date || date == "Invalid Date") return "";
	var str = "";
	str += date.getFullYear().toString();
	str += formatTwoDigit(date.getMonth() + 1);
	str += formatTwoDigit(date.getDate());
	str += formatTwoDigit(date.getHours());
  str += formatTwoDigit(date.getMinutes());
  str += formatTwoDigit(date.getSeconds());
	return str;
}
module.exports.parseDate = function(dateStr) {
	var date = new Date(0);
	date.setYear(dateStr.substr(0, 4));
	date.setMonth(parseInt(dateStr.substr(4, 2)) - 1);
	date.setDate(dateStr.substr(6, 2));
	return date;
}
module.exports.getSimple = function(date) {
	var str = "";
	str += formatTwoDigit(date.getMonth() + 1);
	str += "/";
	str += formatTwoDigit(date.getDate());
	str += " ";
	str += formatTwoDigit(date.getHours());
	str += ":";
	str += formatTwoDigit(date.getMinutes());
	str += ":";
	str += formatTwoDigit(date.getSeconds());
	return str;
}
module.exports.parseSimple = function(str0, reg){
	var m =str0.match(reg);
	return m[1] + formatTwoDigit(m[2]) + formatTwoDigit(m[3]);
}
module.exports.getDatetime = function(date) {
	if (!date) date = new Date();
	var str = "";
	str += date.getFullYear().toString();
	str += formatTwoDigit(date.getMonth() + 1);
	str += formatTwoDigit(date.getDate());
	str += formatTwoDigit(date.getHours());
	str += formatTwoDigit(date.getMinutes());
	str += formatTwoDigit(date.getSeconds());
	return str;
}
module.exports.formatTwoDigit = formatTwoDigit;

function formatTwoDigit(num) {
	if (num < 10)
		return "0" + num.toString();
	else
		return num.toString();
}
module.exports.byday = byday;

function byday(num, minutes, from) {
	if (!num) num = 0;
	if (!minutes) minutes = 0;
	var now = from || new Date();
	var rtn = new Date(0);
	rtn.setYear(now.getYear() + 1900);
	rtn.setMonth(now.getMonth());
	rtn.setDate(now.getDate() + num);
	rtn.setMinutes(now.getTimezoneOffset() + minutes);
	return rtn;
}
module.exports.betweenDate = betweenDate;

function betweenDate(date1, date2) {
	return (byday(0, 0, date1) - byday(0, 0, date2)) / 86400000;
}
/*记录节假日，1-3指放三天假第一天，
4-3指放三天假，第四天虽然是周六周日但是工作
必须记录周六周日但是工作的日子*/
var specail = {
	"20150101": "1-3",
	"20150102": "2-3",
	"20150103": "3-3",
	"20150104": "4-3",
	"20150219": "1-7",
	"20150220": "2-7",
	"20150221": "3-7",
	"20150222": "4-7",
	"20150223": "5-7",
	"20150224": "6-7",
	"20150225": "7-7",
	"20150404": "1-3",
	"20150405": "2-3",
	"20150406": "3-3",
	"20150501": "1-3",
	"20150502": "2-3",
	"20150503": "3-3",
	"20150620": "1-3",
	"20150621": "2-3",
	"20150622": "3-3",
	"20150903": "1-3",
	"20150904": "2-3",
	"20150905": "3-3",
	"20150906": "4-3",
	"20150926": "1-3",
	"20150927": "2-3",
	"20150928": "3-3",
	"20151001": "1-7",
	"20151002": "2-7",
	"20151003": "3-7",
	"20151004": "4-7",
	"20151005": "5-7",
	"20151006": "6-7",
	"20151007": "7-7",
	"20151010": "10-7",
	"20160101": "1-3",
	"20160102": "2-3",
	"20160103": "3-3"
};
module.exports.byworkday = byworkday;

function byworkday(num, minutes, from, split) {
	if (split) {
		if (new Date().getHours() > split)
			return byworkday(num + 1, minutes, from);
		else
			return byworkday(num, minutes, from);
	}
	if (num == 0) return byday(0);
	if (num > 1) return byworkday(num - 1, minutes, byworkday(1, minutes, from));
	if (num < -1) return byworkday(num + 1, minutes, byworkday(-1, minutes, from));
	var candDate = byday(num, minutes, from);
	var day = candDate.getDay();
	var tmp = specail[getDate(candDate)];
	if (tmp) {
		var arr = tmp.split("-");
		arr[0] = parseInt(arr[0]);
		arr[1] = parseInt(arr[1]);
		if (arr[0] <= arr[1]) { //放假中
			if (num > 0) {
				return byday(num + arr[1] - arr[0] + 1, minutes, from);
			} else return byday(num - arr[0], minutes, from);
		} else {
			return candDate;
		}
	}
	if (day == 0) { //Sunday
		if (num > 0) return byday(num + 1, minutes, from);
		else return byday(num - 2, minutes, from);
	} else if (day == 6) { //Sat
		if (num > 0) return byday(num + 2, minutes, from);
		else return byday(num - 1, minutes, from);
	} else {
		return candDate;
	}

}
