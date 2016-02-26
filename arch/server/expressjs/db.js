^^for(var dbname in databases){
var dbconfig = databases[dbname];
if(!dbconfig.type) dbconfig.tyoe = "mongodb";
if(!dbconfig.name) dbconfig.name = dbname;
$$
module.exports.^^=dbname$$ = ^^=~Database: dbconfig$$;
^^}$$
