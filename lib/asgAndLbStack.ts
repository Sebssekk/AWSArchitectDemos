import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcStackProps } from "./types";
import { AutoScalingGroup, StepScalingPolicy } from "aws-cdk-lib/aws-autoscaling";
import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, Peer, Port, Protocol, SecurityGroup, SubnetType, UserData } from "aws-cdk-lib/aws-ec2";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class AsgAndLbStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcStackProps) {
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
    const nginxUserData = UserData.forLinux()
    nginxUserData.addCommands(
        'sudo dnf install -y nginx',
        'sudo systemctl start nginx'
    )
    const template = new LaunchTemplate(this, "DemoLaunchTemplate", {
      launchTemplateName: "demo-launch-template",
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      securityGroup: webSg,
      userData: nginxUserData,
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

    new StepScalingPolicy(this, "ASGScaligPolicy", {
      autoScalingGroup: asg,
      metric: new Metric({
        namespace: 'AWS/EC2',
        metricName: 'CPUUtilization',
        statistic: 'Average',
        period: Duration.minutes(1),
      }),
      scalingSteps: [{
        change: 1,
        upper: 50
      },
      {
        change: 1,
        upper: 80,
      }
    ]
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
    listener.addTargets("Nginx",{
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