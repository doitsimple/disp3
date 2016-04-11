DIR=^^=~srcDir: 1$$
^^
for(var key in global.tests){
$$
mocha $DIR/test/^^=key$$_test.js
^^
}
$$
