import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import autoscaling = require('@aws-cdk/aws-autoscaling');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import {LookupMachineImage, Peer, Port, SubnetType, UserData} from "@aws-cdk/aws-ec2";
import {UpdateType} from "@aws-cdk/aws-autoscaling";
import {Role} from "@aws-cdk/aws-iam";
import {Arn, Stack} from "@aws-cdk/core";
import {ServerApplication, ServerDeploymentConfig, ServerDeploymentGroup} from "@aws-cdk/aws-codedeploy";
import base from "@mintdevops/odyssey/lib/commands/base";
import {StringParameter} from "@aws-cdk/aws-ssm";

export enum Stages {
    DEV = "DEV",
    TEST = "TEST",
    PROD = "PROD"
}

export interface AppProps extends cdk.StackProps{
    name: string,
    stage: Stages,
}

export class ApplicationStack extends cdk.Stack {
    constructor(app: cdk.App, props: AppProps) {
        super(app, props.name, {...props, stackName: `${props.name}-${props.stage}`});

        const root = app.node.root.node

        const baseAmi = root.tryGetContext('baseAmi');

        const vpc = new ec2.Vpc(this, 'VPC');

        const userData = UserData.forLinux({});

        userData.addCommands(
            'sudo amazon-linux-extras install java-openjdk11'
        );

        const imageId = StringParameter.fromStringParameterName(this,  'ImageId', `/app/${props.name}/ami_id`);
        const base = new ec2.GenericLinuxImage({
            [`${Stack.of(this).region}`]: imageId.stringValue
        });

        const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: base,
            userData,
            keyName: 'test',
            updateType: UpdateType.REPLACING_UPDATE,
            vpcSubnets: vpc.selectSubnets({subnetType: SubnetType.PUBLIC}),
            role: Role.fromRoleArn(this, 'instance-role', Arn.format({
                region: '',
                service: 'iam',
                resource: 'role',
                resourceName: `${props.name}-instance-role-${props.stage}`, // convention
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

        const application = ServerApplication.fromServerApplicationName(this, 'DeployContext', props.name); // created by pipeline

        // used by pipeline (asgs dont exist when pipeline is created)
        new ServerDeploymentGroup(this, 'DeployTarget', {
            application,
            deploymentGroupName: props.stage,
            autoScalingGroups: [asg],
            installAgent: true,
            deploymentConfig: ServerDeploymentConfig.ALL_AT_ONCE
        });
    }
}