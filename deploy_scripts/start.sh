#!/bin/bash

DEPLOYMENT_DIR=/opt/example
cd ${DEPLOYMENT_DIR}

nohup ./example.jar > app.log 2>&1 &
echo $! > pid.file