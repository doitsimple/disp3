var redis = require("redis"),
    redisClient = redis.createClient();
redisClient.on("error", function (err) {
  console.log("REDIS Error " + err);
});
module.exports = redisClient;
