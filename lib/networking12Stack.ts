import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { CfnVPCPeeringConnection, FlowLogTrafficType, GatewayVpcEndpointAwsService, InterfaceVpcEndpointAwsService, IpAddresses, ISubnet, Peer, Port, PublicSubnet, RouterType, SecurityGroup, Subnet, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class Networking12Stack extends Stack {
  public readonly demoVpc: Vpc
  public readonly isolatedVpc: Vpc

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.demoVpc = new Vpc(this, "Networking1Vpc", {
        ipAddresses: IpAddresses.cidr("172.16.0.0/16"),
        vpcName: "demo-vpc",
        createInternetGateway: true,
        maxAzs: 3,
        flowLogs: {
            'netLog': {
                trafficType: FlowLogTrafficType.ALL,
            }
        },
        subnetConfiguration: [ 
            {
              cidrMask: 24,
              name: 'ingress',
              subnetType: SubnetType.PUBLIC,
            },
            {
              cidrMask: 24,
              name: 'private',
              subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
        ],
        gatewayEndpoints: {
            S3 : {
                service: GatewayVpcEndpointAwsService.S3
            },
            DynamoDB: {
                service: GatewayVpcEndpointAwsService.DYNAMODB
            }
        }
    })

    this.demoVpc.publicSubnets.forEach((sub: ISubnet, idx: number)=>{
        Tags.of(sub as PublicSubnet).add('Name',`demo-pub-sub-${idx+1}`);
    })
    this.demoVpc.privateSubnets.forEach((sub: ISubnet, idx: number)=>{
        Tags.of(sub as Subnet).add('Name',`demo-priv-sub-${idx+1}`);
    })

    this.isolatedVpc = new Vpc(this, "Networking2Vpc", {
        ipAddresses: IpAddresses.cidr("192.168.0.0/20"),
        vpcName: "remote-vpc",
        createInternetGateway: false,
        maxAzs: 1,
        flowLogs: {
            'netLog': {
                trafficType: FlowLogTrafficType.ALL,
            }
        },
        subnetConfiguration: [ 
            {
              cidrMask: 24,
              name: 'remote',
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
        ],
    })
    this.isolatedVpc.isolatedSubnets.forEach((sub: ISubnet, idx: number)=>{
        Tags.of(sub as Subnet).add('Name',`remote-sub-${idx+1}`)
    })

    const epSG = new SecurityGroup(this, "EndpointSG",{
        securityGroupName: "interface-ep-sg",
        vpc: this.isolatedVpc
    })

    epSG.addIngressRule(
        Peer.ipv4(this.isolatedVpc.vpcCidrBlock),
        Port.allTraffic()
    )
    this.isolatedVpc.addInterfaceEndpoint("IEPssm", {
        service: InterfaceVpcEndpointAwsService.SSM,
        securityGroups: [epSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })
    this.isolatedVpc.addInterfaceEndpoint("IEPssmMsg", {
        service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
        securityGroups: [epSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })
    this.isolatedVpc.addInterfaceEndpoint( "IEPlogs", {
        service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        securityGroups: [epSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })

    this.isolatedVpc.addGatewayEndpoint("IEPgwd", {
        service: GatewayVpcEndpointAwsService.S3,
    })

    const peering = new CfnVPCPeeringConnection(this, "VPCPeering",{
        peerVpcId: this.demoVpc.vpcId,
        vpcId: this.isolatedVpc.vpcId,
        tags: [{
            key: "Name",
            value: "demo-peering-vpc"
        }]
    })

    this.isolatedVpc.isolatedSubnets.forEach((sub: ISubnet) => {
            (sub as Subnet).addRoute("RouteToDemo", {
                destinationCidrBlock: this.demoVpc.vpcCidrBlock,
                routerType: RouterType.VPC_PEERING_CONNECTION,
                routerId: peering.attrId
            });
        }
    );

    (this.demoVpc.privateSubnets.concat(this.demoVpc.publicSubnets)).map((sub: ISubnet) => {
            (sub as Subnet).addRoute("RouteToRemote", {
                destinationCidrBlock: this.isolatedVpc.vpcCidrBlock,
                routerType: RouterType.VPC_PEERING_CONNECTION,
                routerId: peering.attrId
            });
        }
    );
  }
}