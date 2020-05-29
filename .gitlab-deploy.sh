#!/bin/bash
#Get servers list
set -e
 
ankan=mukherjee
 
DEPLOY_SERVERS=$DEPLOY_SERVERS  
ALL_SERVERS=(${DEPLOY_SERVERS//,/ })
for server in "${ALL_SERVERS[@]}"
 
  echo "Deploying information to EC2 and Gitlab"
  echo "Deploy project on server ${server}"
  ssh ubuntu@${server}  'bash -s' < ./deploy/updateAndRestart.sh
done
