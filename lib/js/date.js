module.exports.formatDate = formatDate;
function formatDate(date, fmt){
  //author: meizz
  var o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  console.log(fmt);
  return fmt;
}

module.exports.getDate = function(date){
	var str = "";
  str += date.getFullYear().toString();
  str += formatTwoDigit(date.getMonth()+1);
  str += formatTwoDigit(date.getDate());
	return str;
}
module.exports.getDatetime = function(date){
	var str = "";
  str += date.getFullYear().toString();
  str += formatTwoDigit(date.getMonth()+1);
  str += formatTwoDigit(date.getDate());
  str += formatTwoDigit(date.getHours());
  str += formatTwoDigit(date.getMinutes());
  str += formatTwoDigit(date.getSeconds());
  return str;
}
function formatTwoDigit(num){
  if(num<10)
    return "0" + num.toString();
  else
    return num.toString();
}
