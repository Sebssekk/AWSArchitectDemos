import { RemovalPolicy, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { AuroraMysqlEngineVersion, ClientPasswordAuthType, ClusterInstance, DatabaseCluster, DatabaseClusterEngine, DatabaseProxy, ProxyTarget } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { VpcAndSGStackProps } from "./types";
import { InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";

export class AuroraStack extends Stack {
  constructor(scope: Construct, id: string, props?: VpcAndSGStackProps) {
    super(scope, id, props);

    const auroraSG = new SecurityGroup(this, "AuroraSG", {
            securityGroupName: "aurora-sg",
            vpc: props!.vpc
        })
    auroraSG.addIngressRule(
        Peer.securityGroupId(props!.sg!.securityGroupId),
        Port.MYSQL_AURORA
    )
    new DatabaseCluster(this, 'DemoAuroraMysql', {
        clusterIdentifier: "demo-aurora-mysql",
        securityGroups: [auroraSG],
        engine: DatabaseClusterEngine.auroraMysql({
            version: AuroraMysqlEngineVersion.VER_3_10_0,
        }),
        writer: ClusterInstance.provisioned('writer',{
            instanceType: InstanceType.of(InstanceClass.T3,InstanceSize.MEDIUM),
            instanceIdentifier: "demo-aurora-mysql-writer"
        }),
        readers:[ClusterInstance.provisioned('reader',{
            instanceType: InstanceType.of(InstanceClass.T3,InstanceSize.MEDIUM),
            instanceIdentifier: "demo-aurora-mysql-reader"
        })
        ],
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