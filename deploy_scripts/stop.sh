#!/bin/bash

DEPLOYMENT_DIR=/opt/SpringBootMavenExample
cd ${DEPLOYMENT_DIR}

if [[ -f pid.file ]]
then
  kill $(cat pid.file) || true
fi