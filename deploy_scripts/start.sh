#!/bin/bash

DEPLOYMENT_DIR=/opt/SpringBootMavenExample
cd ${DEPLOYMENT_DIR}

nohup ./SpringBootMavenExample.jar > app.log 2>&1 &
echo $! > pid.file