import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcStackProps } from "./types";
import { ContainerImage, Ec2Service, Ec2TaskDefinition, Cluster as ECSCluster, EcsOptimizedImage, Protocol} from "aws-cdk-lib/aws-ecs";
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcStackProps) {
    super(scope, id, props);

    const nginxRepo = new DockerImageAsset(this, "NginxDOckerImage", {
      directory: "./mod09-containers/ecr-repo",
      assetName: "demo-nginx",
      displayName: "demo-nginx"
    })

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

    const taskDefinition = new Ec2TaskDefinition(this, 'DemoTaskDef');
    taskDefinition.addContainer("DemoContainer", {
      image: ContainerImage.fromDockerImageAsset(nginxRepo),
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
    })

  }
}