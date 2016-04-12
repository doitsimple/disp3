DIR=^^=~srcDir: 1$$
^^
for(var key in global.tests){
if(!global.tests[key].isfirst) continue;
$$
mocha $DIR/test/^^=key$$_test.js
^^
}
$$
^^
for(var key in global.tests){
if(global.tests[key].isfirst) continue;
$$
mocha $DIR/test/^^=key$$_test.js
^^
}
$$
