^^
for(var key in global.jsLib){
 var toeval = {};
	if(key == "content"){
 toeval = global.jsLib[key];
	}else{
 toeval[key] = global.jsLib[key];
	}
$$
^^=~toeval$$; 
^^}$$
^^
for(var key in global.angularLib){
 var toeval = {};
 toeval[key] = global.angularLib[key];
$$
^^=~toeval$$; 
^^}$$
^^=~content$$
