#!/bin/bash
DISP3=^^=global.dispBin$$
#DIR=`dirname $BASH_SOURCE[0]`
DATE=`date +%Y%m%d`
^^
if(!global.remote.port){
	global.remote.port = 22;
}
$$
$DISP3 -t deploy -x deploy && rsync -avz -e "ssh -p ^^=global.remote.port$$" deploy/. ^^=global.remote.url$$



