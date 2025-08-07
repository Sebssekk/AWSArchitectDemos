import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIAndLambdasStack } from "./apiAndLambdasStack";
import { DynamoDBStack } from "./dynamoDBStack";
import { PermissionStack } from "./permissionStack";
import { S3NotificationStack } from "./s3NotificationStack";
import { S3WebHostingStack } from "./s3webHostingStack";
import { ServerlessStack } from "./serverlessStack";
import { Networking12Stack } from "./networking12Stack";
import { FileSystemSharingStack } from "./fileSystemSharingStack";
import { AuroraStack } from "./auroraStack";
import { AsgAndLbStack } from "./asgAndLbStack";
import { ContainerStack } from "./containersStack";

export class Cdk4AwsArchitectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Module 2
    new PermissionStack(this, "PermissionStack", {
      stackName: "AWSArchitect-PermissionStack",
    });

    // Module 3 & 10
    const netStack = new Networking12Stack(this, "Networking12Stack", {
      stackName: "AWSArchitect-Networking12Stack"
    })

    // Module 4
    new APIAndLambdasStack(this, "APIAndLambdasStack", {
      stackName: "AWSArchitect-APIAndLambdasStack",
    });

    // Module 5
    new S3NotificationStack(this, "S3NotificationStack", {
      stackName: "AWSArchitect-S3NotificationStack",
    });
    new S3WebHostingStack(this, "S3WebHostingStack", {
      stackName: "AWSArchitect-S3WebHostingStack",
    });
    new FileSystemSharingStack(this, "EFSSharingStack", {
      stackName : "AWSArchitect-EFSSharingStack",
      vpc: netStack.demoVpc,
      vmSg: netStack.demoPrivSG
    })

    // Module 6
    new AuroraStack(this, "AuroraStack", {
      stackName: "AWSArchitect-AuroraStack",
      vpc: netStack.demoVpc,
      vmSg: netStack.demoPrivSG
    });
    new DynamoDBStack(this, "DynamoDBStack", {
      stackName: "AWSArchitect-DynamoDBStack",
    });
    
    // Module 7
    new AsgAndLbStack(this, "AsgAndElbStack", {
      stackName: "AWSArchitect-AsgAndElbStack",
      vpc: netStack.demoVpc,
      vmSg: netStack.demoPrivSG
    });

    // Module 9
    new ContainerStack(this, "ContainerStack", {
      stackName: "AWSArchitect-ContainerStack",
      vpc: netStack.demoVpc,
      vmSg: netStack.demoPrivSG
    });

    // Module 11
    new ServerlessStack(this, "ServerlessStack", {
      stackName: "AWSArchitect-ServerlessStack",
    });
  }
}
