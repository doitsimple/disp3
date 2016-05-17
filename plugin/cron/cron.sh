DIRNAME=^^=~srcDir:1$$
PROJECT=${DIRNAME}/.. perl -p -e 's/PROJECT/$ENV{PROJECT}/g' ${DIRNAME}/cron.conf.origin > ${DIRNAME}/cron.conf
crontab ${DIRNAME}/cron.conf
