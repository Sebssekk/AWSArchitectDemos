import { Duration, Stack, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcAndSGStackProps } from "./types";
import { AutoScalingGroup, StepScalingPolicy } from "aws-cdk-lib/aws-autoscaling";
import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, Peer, Port, Protocol, SecurityGroup, SubnetType, UserData } from "aws-cdk-lib/aws-ec2";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";

export class AsgAndLbStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcAndSGStackProps) {
    super(scope, id, props);

    const lbSg = new SecurityGroup(this, "LbSG", {
      securityGroupName: "lb-SG",
      vpc: props!.vpc
    })
    lbSg.addIngressRule(
      Peer.anyIpv4(),
      Port.HTTP
    )

    const webSg = new SecurityGroup(this, "WebSG", {
      securityGroupName: "web-SG",
      vpc: props!.vpc
    })
    webSg.addIngressRule(
      Peer.securityGroupId(lbSg.securityGroupId),
      Port.allTraffic()
    )
    const asgRole = new Role(this, "SSMRole", {
        roleName: "demo-asg-role",
        assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ]
    })
    const webappUserData = UserData.forLinux()
    webappUserData.addCommands(
        'sudo dnf install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'sudo systemctl start amazon-ssm-agent',
        'sudo dnf install -y docker',
        'sudo systemctl start docker',
        'sudo docker run -e IP=$( hostname -I ) -e HOSTNAME=$( hostname ) -p 80:3000 -d sebssekk/hello-app'
    )
    const template = new LaunchTemplate(this, "DemoLaunchTemplate", {
      launchTemplateName: "demo-launch-template",
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      securityGroup: webSg,
      role: asgRole,
      userData: webappUserData,
    }) 

    const asg = new AutoScalingGroup(this, "DemoASG", {
      autoScalingGroupName: "demo-asg",
      minCapacity: 2,
      maxCapacity: 5,
      vpc: props!.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
      },
      launchTemplate: template,
    })

    Tags.of(asg).add("Name", "demo-asg")

    asg.scaleOnCpuUtilization("CPUUtilizationScaling", {
      targetUtilizationPercent: 50,
      cooldown: Duration.minutes(1),
      estimatedInstanceWarmup: Duration.seconds(20),
    })

    const lb = new ApplicationLoadBalancer(this, "DemoELB", {
      loadBalancerName: "demo-elb",
      vpc: props!.vpc,
      securityGroup: lbSg,
      internetFacing: true,
    })

    const listener = new ApplicationListener(this, "DemoElbListener", {
      loadBalancer: lb,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
    })
    listener.addTargets("Webapp",{
      targetGroupName: "webapp-targets",
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targets: [asg],
      healthCheck: {
        enabled: true,
        healthyHttpCodes: "200",
        port: "80",
        path: "/"
      }
    })
  }
}