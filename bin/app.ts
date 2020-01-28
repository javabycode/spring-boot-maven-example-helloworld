#!/usr/bin/env node
import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/core');
import {Peer, Port, SubnetType, UserData} from '@aws-cdk/aws-ec2';
import {ServerApplication, ServerDeploymentConfig, ServerDeploymentGroup} from '@aws-cdk/aws-codedeploy';
import {UpdateType} from "@aws-cdk/aws-autoscaling";
import {Role} from "@aws-cdk/aws-iam";
import {Arn} from "@aws-cdk/core";

class LoadBalancerStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id);

        const vpc = new ec2.Vpc(this, 'VPC');

        const userData = UserData.forLinux({})

        userData.addCommands(
            'sudo amazon-linux-extras install java-openjdk11'
        );

        const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage(),
            userData,
            keyName: 'test',
            updateType: UpdateType.REPLACING_UPDATE,
            vpcSubnets: vpc.selectSubnets({subnetType: SubnetType.PUBLIC}),
            role: Role.fromRoleArn(this, 'instance-role', Arn.format({
                region: '',
                service: 'iam',
                resource: 'role',
                resourceName: 'example-instance-role', // convention
                //sep: ':'
            }, this))
        });

        const [defaultSg] = asg.connections.securityGroups;

        defaultSg.addIngressRule(
            Peer.ipv4('195.206.170.210/32'),
            Port.tcp(22),
            'ssh');

        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc,
            internetFacing: true
        });

        const listener = lb.addListener('Listener', {
            port: 80,
        });

        listener.addTargets('Target', {
            port: 80,
            targets: [asg]
        });

        listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

        asg.scaleOnRequestCount('AModestLoad', {
            targetRequestsPerSecond: 1
        });

        const serverapplication = new ServerApplication(this, 'serverapplication', {
            applicationName: 'example'
        });

        new ServerDeploymentGroup(this, 'deploymentgroup', {
            application: serverapplication,
            deploymentGroupName: 'example-pipeline-TEST',
            autoScalingGroups: [asg],
            installAgent: true,
            deploymentConfig: ServerDeploymentConfig.ALL_AT_ONCE,
        });
    }
}

const app = new cdk.App();
new LoadBalancerStack(app, 'app');
app.synth();