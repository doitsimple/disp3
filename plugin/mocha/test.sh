DIR=^^=~srcDir: 1$$
^^=~dropDatabase:"main"$$
^^
$.forBySeq(global.tests, function(key){
$$
mocha $DIR/test/^^=key$$_test.js
^^
})
$$
