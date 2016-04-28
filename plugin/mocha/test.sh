DIR=^^=~srcDir: 1$$
^^for(var key in global.databases){$$
^^=~dropDatabase:global.databases[key], name:key$$
^^}$$
^^
$.forBySeq(global.tests, function(key){
$$
mocha $DIR/test/^^=key$$_test.js
^^
})
$$
