import { RemovalPolicy, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { AuroraMysqlEngineVersion, ClientPasswordAuthType, ClusterInstance, DatabaseCluster, DatabaseClusterEngine, DatabaseProxy, ProxyTarget } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { VpcStackProps } from "./types";
import { Peer, Port, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";

export class AuroraStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcStackProps) {
    super(scope, id, props);

    const auroraSG = new SecurityGroup(this, "AuroraSG", {
            securityGroupName: "aurora-sg",
            vpc: props!.vpc
        })
    auroraSG.addIngressRule(
        Peer.securityGroupId(props!.vmSg!.securityGroupId),
        Port.MYSQL_AURORA
    )
    const auroraCluster = new DatabaseCluster(this, 'DemoAuroraMysql', {
        securityGroups: [auroraSG],
        engine: DatabaseClusterEngine.auroraMysql({
            version: AuroraMysqlEngineVersion.VER_3_09_0,
        }),
        writer: ClusterInstance.provisioned('writer'),
        vpc: props!.vpc ,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS
        },
        removalPolicy: RemovalPolicy.DESTROY,
        defaultDatabaseName: "demo",
        credentials: {
            username: 'demo',
            password: SecretValue.unsafePlainText("password1234")
        }
        
    });
  }
}