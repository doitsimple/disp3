var signinUrl = "#/^^=local.signin || 'signin'$$";
var authUrls = {
	"/": 1,
	"/signin": 1,
	"/error": 1
}
rootApp.run(function ($rootScope, auth) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
		console.log(next);
    if(next.\$\$route && 
			 next.\$\$route.originPath && 
			 !authUrls[next.\$\$route.originPath] && 
			 !auth.gettoken()){
      event.preventDefault();
      window.location = signinUrl;
    }
  });
});

rootApp.factory('auth', function($http, $cookieStore, $rootScope){
  var methods = {};
  var idstr = "^^=local.name$$";
  var persist = ["token", "user"];
  persist.forEach(function(p){
    methods["get" + p] = function(){
      var str;
      try{
        str = $cookieStore.get(p+idstr);
      }catch(e){
        return null;
      }
      return str;
    };
    methods["set" + p] = function(str){
			if(!str) str = "";
      $cookieStore.put(p+idstr, str.toString());
    };
  });
  methods.get = function(){
    var rtn = {};
    persist.forEach(function(p){
      rtn[p] = methods["get" + p]();
    });
    return rtn;
  }
  methods.set = function(json){
    persist.forEach(function(p){
      methods["set" + p](json[p]);
    });
  }
  methods.signout = function(){
    methods.set({});
    location = signinUrl;
  }
  return methods;
});
