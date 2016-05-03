var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use("/", 
express.static(__dirname + "/" + "../client")
)

app.use("/vendor", 
express.static(__dirname + "/" + "../vendor")
)

var router_api = new express.Router();
router_api.use("/get", 
function(req, res, next){
res.send({"a":1});;
}
)


app.use("/api", router_api)



module.exports = app;
