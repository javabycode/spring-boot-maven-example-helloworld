#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import {ApplicationStack, Stages} from "./stack";

const root = new cdk.App();
const stage = root.node.tryGetContext('stage') || Stages.DEV;

new ApplicationStack(root,  {
    name: 'example',
    stage: <Stages>stage
});
