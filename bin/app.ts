#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import {ApplicationStack, Stages} from "./stack";

const root = new cdk.App();
const stage = root.node.tryGetContext('stage') || Stages.DEV;

/*
    As this is an example it has omitted some best practices for brevity:

    1. shared resources e.g. would be imported
    2. application tiers split into separate stacks e.g. DB, App, Expose, Monitor
    3. tiers leverage custom constructs or factory methods to reduce coding effort
    4. base stack which configures consistent tagging, stack policies and governance (aspects)
    5. always keep your prod stack separate to avoid fat fingering and applying accidental updates outside of CI/CD
 */
new ApplicationStack(root,  {
    name: 'example',
    stage: <Stages>stage,
    env: {
        region: process.env.CDK_DEFAULT_REGION
    }
});
