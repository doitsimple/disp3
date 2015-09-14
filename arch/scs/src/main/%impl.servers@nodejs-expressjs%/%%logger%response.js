	var log = "\x1b[1;35m";
	if(code) log+=code.toString() + "=>";
	log += msg;
	log += "\x1b[0m";
  console.log(log);
