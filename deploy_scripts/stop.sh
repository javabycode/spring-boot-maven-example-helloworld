#!/bin/bash

DEPLOYMENT_DIR=/opt/example
cd ${DEPLOYMENT_DIR}

if [[ -f pid.file ]]
then
  kill $(cat pid.file) || true
fi