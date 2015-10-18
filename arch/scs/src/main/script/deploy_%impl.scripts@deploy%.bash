#!/bin/bash
DISP3=^^=global.bin$$

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
echo $DIR

cd $DIR/.. && $DISP3 ^^=name$$ && cd -
cd ^^=localurl || "../"+name$$ && rsync -avz -e "ssh -p ^^=port$$" . ^^=remoteurl$$ && ssh -p ^^=port$$ ^^=remoteurl.split(':')[0]$$ "cd ^^=remoteurl.split(':')[1] || '.'$$ && ./script/server_restart"
