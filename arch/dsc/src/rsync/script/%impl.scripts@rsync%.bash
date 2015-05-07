#!/bin/bash
DISP3=^^=global.project.bin$$

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
echo $DIR

cd $DIR/.. && $DISP3 prod && cd -
cd ^^=localurl$$ && rsync -avz -e "ssh -p ^^=port$$" . ^^=remoteurl$$
