import { RemovalPolicy, Stack, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ECRStackProps, VpcAndSGStackProps } from "./types";
import { ContainerImage, Ec2Service, Ec2TaskDefinition, Cluster as ECSCluster, EcsOptimizedImage, Protocol} from "aws-cdk-lib/aws-ecs";
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { Repository as ECRRepository} from "aws-cdk-lib/aws-ecr";
import { Code, Repository } from "aws-cdk-lib/aws-codecommit";
import { Project, Source } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline, ProviderType } from "aws-cdk-lib/aws-codepipeline";
import { CodeBuildAction, CodeCommitSourceAction, CodeDeployEcsDeployAction, EcsDeployAction } from "aws-cdk-lib/aws-codepipeline-actions";

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcAndSGStackProps & ECRStackProps) {
    super(scope, id, props);

    const ecsCluster = new ECSCluster(this, "DemoECS", {
      clusterName: "demo-ecs-cluster",
      vpc: props!.vpc,
      enableFargateCapacityProviders: true,
      capacity: {
        minCapacity: 1,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.SMALL),
        machineImage: EcsOptimizedImage.amazonLinux2023(),
        maxCapacity: 3
      }
    })
    Tags.of(ecsCluster.autoscalingGroup as AutoScalingGroup).add("Name", "demo-ecs-cluster-asg")

    const taskDefinition = new Ec2TaskDefinition(this, 'DemoTaskDef');
    taskDefinition.addContainer("DemoContainer", {
      image: ContainerImage.fromEcrRepository(props!.ecrRepo, "latest"),
      portMappings: [
        {
          protocol: Protocol.TCP,
          containerPort: 80,
        }
      ],
      memoryLimitMiB: 100
    })
    const ecsService = new Ec2Service(this, "DemoECSService", {
      serviceName: "nginx",
      cluster: ecsCluster,
      taskDefinition: taskDefinition,
    })

    const lbSg = new SecurityGroup(this, "ECSLbSG", {
          securityGroupName: "ecs-lb-SG",
          vpc: props!.vpc
    })
    const ecsLb = new ApplicationLoadBalancer(this, "ECSELB", {
      loadBalancerName: "ecs-elb",
      vpc: props!.vpc,
      securityGroup: lbSg,
      internetFacing: true,
    })

    const listener = new ApplicationListener(this, "DemoElbListener", {
      loadBalancer: ecsLb,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
    })
    listener.addTargets("ECSServiceNginx",{
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targets: [ecsService],
      targetGroupName: "nginx-targets",
    })

  }
}