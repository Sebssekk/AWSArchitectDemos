import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { FileSystem } from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";
import { VpcAndSGStackProps } from "./types";
import { Peer, Port, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";

export class FileSystemSharingStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcAndSGStackProps) {
    super(scope, id, props);

    const efsPrivSG = new SecurityGroup(this, "EFSPrivSG", {
        securityGroupName: "efs-priv-sg",
        vpc: props!.vpc
    })

    efsPrivSG.addIngressRule(
        Peer.securityGroupId(props!.sg!.securityGroupId),
        Port.NFS
    )
    efsPrivSG.addEgressRule(
        Peer.securityGroupId(props!.sg!.securityGroupId),
        Port.allTraffic()
    )

    new FileSystem(this, "DemoEFS", {
        securityGroup: efsPrivSG,
        fileSystemName: "demo-fs",
        vpc: props!.vpc,
        removalPolicy: RemovalPolicy.DESTROY,
        allowAnonymousAccess: true,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS
        }
    })
  }
}