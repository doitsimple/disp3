var redis = require("redis");
var redisClient = redis.createClient();
 // client.select(3, function() { /* ... */ });
redisClient.on("error", function (err) {
  console.log("REDIS Error " + err);
});
module.exports=function(){
}
