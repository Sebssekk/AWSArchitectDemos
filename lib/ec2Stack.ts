import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcsStackProps } from "./types";
import { SecurityGroup, Peer, Port, KeyPair, KeyPairFormat, KeyPairType, Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, SubnetType, UserData, WindowsVersion } from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";

export class Ec2Stack extends Stack {
  public readonly pubSG: SecurityGroup
  public readonly privSG: SecurityGroup
  public readonly isolatedSG: SecurityGroup

  constructor(scope: Construct, id: string, props?: VpcsStackProps) {
    super(scope, id, props);    

    this.pubSG = new SecurityGroup(this, "DemoPubSG", {
            securityGroupName: "pub-sg",
            vpc: props!.vpc1
        })
    
        this.pubSG.addIngressRule(
            Peer.anyIpv4(),
            Port.HTTP
        )
        this.pubSG.addIngressRule(
            Peer.anyIpv4(),
            Port.HTTPS
        )
        this.pubSG.addIngressRule(
            Peer.anyIpv4(),
            Port.SSH
        )
        this.pubSG.addIngressRule(
            Peer.anyIpv4(),
            Port.RDP
        )
    this.privSG = new SecurityGroup(this, "DemoPrivSG", {
        securityGroupName: "priv-sg",
        vpc: props!.vpc1
    })
    this.privSG.addIngressRule(
        Peer.anyIpv4(),
        Port.HTTPS
    )
    
    this.isolatedSG = new SecurityGroup(this, "DemoIsolatedSG",{
        securityGroupName: "isolated-sg",
        vpc: props!.vpc2
    })

    this.isolatedSG.addIngressRule(
        Peer.ipv4(props!.vpc1.vpcCidrBlock),
        Port.allTraffic()
    )
    this.isolatedSG.addIngressRule(
        Peer.ipv4(props!.vpc2.vpcCidrBlock),
        Port.allTraffic()
    )
    const winKey = new KeyPair(this, "WinKeyPair", {
        keyPairName: "demo-win-key",
        format: KeyPairFormat.PEM,
        type: KeyPairType.RSA
    })

    const sshKey = new KeyPair(this, "LinKeyPair", {
        keyPairName: "demo-lin-key",
        format: KeyPairFormat.PEM,
        type: KeyPairType.ED25519
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
        vpc: props!.vpc1,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        securityGroup: this.pubSG,
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
        vpc: props!.vpc1,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestWindows(WindowsVersion.WINDOWS_SERVER_2025_ENGLISH_CORE_BASE,),
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        securityGroup: this.pubSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        keyPair: winKey,
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
        vpc: props!.vpc1,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        securityGroup: this.privSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        userData: ssmUserData,
    })

    
    new Instance(this, "DemoInstanceIsolated", {
        instanceName: "isolated-ec2",
        vpc: props!.vpc2,
        instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
        machineImage: MachineImage.latestAmazonLinux2023(),
        vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
        securityGroup: this.isolatedSG,
        role: ssmRole,
        ssmSessionPermissions: true,
        userData: ssmUserData,
    })
    
  }
}