#!/bin/bash
#Get servers list
echo"$DEPLOY_SERVERS"

set -f
 
ssh ubuntu@"$DEPLOY_SERVERS"  'bash -s' < ./deploy/updateAndRestart.sh
#Iterate servers for deploy and pull last commit
# for i in "${!array[@]}"; do
#   echo "Deploying information to EC2 and Gitlab"
#   echo "Deploy project on server ${array[i]}"
#   ssh ubuntu@${array[i]}  'bash -s' < ./deploy/updateAndRestart.sh
# done
