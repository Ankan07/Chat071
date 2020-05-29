#!/bin/bash
#Get servers list
set -e
 
 
 
ankan=$DEPLOY_SERVERS   
length=${#ankan}
echo "Length of '$ankan' is $length"
# ALL_SERVERS=(${DEPLOY_SERVERS//,/ })
# for server in "${ALL_SERVERS[@]}"
# do
#   echo "Deploying information to EC2 and Gitlab"
#   echo "Deploy project on server ${server}"
#   ssh ubuntu@${server}  'bash -s' < ./deploy/updateAndRestart.sh
# done
 
