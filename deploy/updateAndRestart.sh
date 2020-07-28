#!/bin/bash
echo "are bhai bhai bhai"
# any future command that fails will exit the script
set -e

# Delete the old repo
rm -rf /home/ubuntu/backend
echo "removed old directory"
# clone the repo again 
git clone -b ankan --single-branch https://pjN3nsNarcQgEWsHJceU:pjN3nsNarcQgEWsHJceU@gitlab.com/essentials1/backend.git

 
 
#source the nvm file. In an non
#If you are not using nvm, add the actual path like
# PATH=/home/ubuntu/node/bin:$PATH
#source /home/ubuntu/.nvm/nvm.sh

# stop the previous pm2
#good
pm2 kill

# starting pm2 daemon
pm2 status
 
cd /home/ubuntu/backend

#install npm packages
echo "Running npm install"
npm install
echo "before build"
#Build the node server
npm run build

#Start the pm2 server
pm2 start dist/app.js 
