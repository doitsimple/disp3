#!/bin/bash
DISP3=^^=global._dispBin$$
DATE=`date +%Y%m%d`
^^
if(!local.remote.port){
	local.remote.port = 22;
}
$$
$DISP3 -t ^^=argv$$ -x ^^=argv$$ 
^^
for(var f in local.staticResource){
$$
mkdir -p ^^=argv$$/^^=path.dirname(f)$$
cp ^^=f$$ ^^=argv$$/^^=f$$
^^
}
$$
rsync -avz -e "ssh -p ^^=local.remote.port$$" ^^=argv$$/. ^^=local.remote.url$$



