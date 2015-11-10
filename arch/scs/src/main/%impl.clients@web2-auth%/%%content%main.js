var signinUrl = "#/^^=local.signin || 'signin'$$";
var noauthUrls = {
	"/": 1,
	"/signin": 1,
	"/error": 1
}
rootApp.run(function ($rootScope, auth) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    if(next.\$\$route && 
			 next.\$\$route.originalPath && 
			 !noauthUrls[next.\$\$route.originalPath] && 
			 !auth.gettoken()){
			console.log("change")
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
        return undefined;
      }
      try{
				str = JSON.parse(str);
      }catch(e){
        return str;
      }
      return str;
    };
    methods["set" + p] = function(str){
			if(!str) str = "";
      $cookieStore.put(p+idstr, JSON.stringify(str));
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
