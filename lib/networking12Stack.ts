import { Stack, StackProps } from "aws-cdk-lib";
import { CfnVPCPeeringConnection, FlowLogTrafficType, GatewayVpcEndpointAwsService, Instance, InstanceClass, InstanceSize, InstanceType, InterfaceVpcEndpointAwsService, IpAddresses, ISubnet, KeyPair, MachineImage, Peer, Port, RouterType, SecurityGroup, Subnet, SubnetFilter, SubnetType, UserData, Vpc, WindowsVersion } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import path = require("path");

export class Networking12Stack extends Stack {
  public readonly demoVpc: Vpc
  public readonly demoPrivSG: SecurityGroup

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.demoVpc = new Vpc(this, "Networking1Vpc", {
        ipAddresses: IpAddresses.cidr("172.16.0.0/16"),
        vpcName: "demoVpc",
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
            {
              cidrMask: 24,
              name: 'isolated',
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
        ],
        gatewayEndpoints: {
            S3 : {
                service: GatewayVpcEndpointAwsService.S3
            }
        }
    })

    const isolatedVpc = new Vpc(this, "Networking2Vpc", {
        ipAddresses: IpAddresses.cidr("192.168.0.0/20"),
        vpcName: "demoIsolatedVpc",
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
    const isolatedSG = new SecurityGroup(this, "IsolatedVpcSG",{
        securityGroupName: "interface-ep-sg",
        vpc: isolatedVpc
    })

    isolatedSG.addIngressRule(
        Peer.ipv4(isolatedVpc.vpcCidrBlock),
        Port.allTraffic()
    )
    isolatedVpc.addInterfaceEndpoint("IEPssm", {
        service: InterfaceVpcEndpointAwsService.SSM,
        securityGroups: [isolatedSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })
    isolatedVpc.addInterfaceEndpoint("IEPssmMsg", {
        service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
        securityGroups: [isolatedSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })
    isolatedVpc.addInterfaceEndpoint( "IEPlogs", {
        service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        securityGroups: [isolatedSG],
        subnets: {
            subnetType: SubnetType.PRIVATE_ISOLATED
        }
    })

    isolatedVpc.addGatewayEndpoint("IEPgwd", {
        service: GatewayVpcEndpointAwsService.S3,
    })

    const peering = new CfnVPCPeeringConnection(this, "VPCPeering",{
        peerVpcId: this.demoVpc.vpcId,
        vpcId: isolatedVpc.vpcId,
        tags: [{
            key: "Name",
            value: "demo-peering-vpc"
        }]
    })

    isolatedVpc.isolatedSubnets.map((sub: ISubnet) => {
            (sub as Subnet).addRoute("RouteToDemo", {
                destinationCidrBlock: this.demoVpc.vpcCidrBlock,
                routerType: RouterType.VPC_PEERING_CONNECTION,
                routerId: peering.attrId
            });
        }
    );

    this.demoVpc.selectSubnets({
        subnetFilters: [SubnetFilter.byCidrMask(24)]
    }).subnets.map((sub: ISubnet) => {
            (sub as Subnet).addRoute("RouteToRemote", {
                destinationCidrBlock: isolatedVpc.vpcCidrBlock,
                routerType: RouterType.VPC_PEERING_CONNECTION,
                routerId: peering.attrId
            });
        }
    );



    const pubSG = new SecurityGroup(this, "DemoPubSG", {
        securityGroupName: "pub-sg",
        vpc: this.demoVpc
    })

    pubSG.addIngressRule(
        Peer.anyIpv4(),
        Port.HTTP
    )
    pubSG.addIngressRule(
        Peer.anyIpv4(),
        Port.HTTPS
    )
    pubSG.addIngressRule(
        Peer.anyIpv4(),
        Port.SSH
    )
    pubSG.addIngressRule(
        Peer.anyIpv4(),
        Port.RDP
    )

    this.demoPrivSG = new SecurityGroup(this, "DemoPrivSG", {
        securityGroupName: "priv-sg",
        vpc: this.demoVpc
    })
    this.demoPrivSG.addIngressRule(
        Peer.anyIpv4(),
        Port.HTTPS
    )
    
    const sshKey = new KeyPair(this, "SSHKeyPair", {
        keyPairName: "demo-ssh-key",
        publicKeyMaterial: readFileSync("./mod04-compute/ssh-key_ed25519.pub", {encoding:"utf-8"})
    })

    const ssmRole = new Role(this, "SSMRole", {
        roleName: "demo-ssm-role",
        assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        ]
    })

    new Instance(this, "DemoInstancePub", {
        instanceName: "pub-ec2",
        vpc: this.demoVpc,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        securityGroup: pubSG,
        keyPair: sshKey
    })

    const ssmUserDataWin = UserData.forWindows()

    ssmUserDataWin.addCommands(
        "[System.Net.ServicePointManager]::SecurityProtocol = 'TLS12'",
        "$progressPreference = 'silentlyContinue'",
        "Invoke-WebRequest https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/windows_amd64/AmazonSSMAgentSetup.exe -OutFile $env:USERPROFILE\Desktop\SSMAgent_latest.exe",
        'Start-Process -FilePath $env:USERPROFILE\Desktop\SSMAgent_latest.exe -ArgumentList "/S" -Wait',
        'rm $env:USERPROFILE\Desktop\SSMAgent_latest.exe -Force',
        "Restart-Service AmazonSSMAgent"
    )

    new Instance(this, "DemoInstancePubWin", {
        instanceName: "pub-ec2-win",
        vpc: this.demoVpc,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestWindows(WindowsVersion.WINDOWS_SERVER_2025_ENGLISH_CORE_BASE,),
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        securityGroup: pubSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        //keyPair: sshKey,
        userData: ssmUserDataWin
    })

    const ssmUserData = UserData.forLinux()

    ssmUserData.addCommands(
        'sudo dnf install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'sudo systemctl start amazon-ssm-agent',
        'sudo dnf -y install mariadb105'
    )

    new Instance(this, "DemoInstancePriv", {
        instanceName: "priv-ec2",
        vpc: this.demoVpc,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        securityGroup: this.demoPrivSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        userData: ssmUserData,
    })

    
    new Instance(this, "DemoInstanceIsolated", {
        instanceName: "isolated-ec2",
        vpc: isolatedVpc,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
        securityGroup: isolatedSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        userData: ssmUserData,
    })
  }
}