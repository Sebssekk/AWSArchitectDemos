import {
  Stack,
  StackProps,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import { AwsCliLayer } from "aws-cdk-lib/lambda-layer-awscli";

export class APIAndLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- snackGenerator Function ---

    const snackApiLogGroup = new logs.LogGroup(this, "PrdLogs", {
      logGroupName: "snackGenFunc_prod_log",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const demoLayer = new lambda.LayerVersion(this, "DemoLayer", {
      removalPolicy: RemovalPolicy.DESTROY,
      code: lambda.Code.fromAsset("./mod04-compute/demoLayer"),
      compatibleArchitectures: [
        lambda.Architecture.X86_64,
        lambda.Architecture.ARM_64,
      ],
      compatibleRuntimes: [lambda.Runtime.NODEJS_LATEST],
    });

    const snackGeneratorFunc = new lambda.Function(this, "SnackgenFunc", {
      functionName: "snackGeneratorFunction",
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./mod04-compute/snackGenerator"),
      tracing: lambda.Tracing.ACTIVE,
      layers: [demoLayer, new AwsCliLayer(this, "AWSCliLayer")],
    });

    const snackGenApi = new apigateway.RestApi(this, "SnackGenApi", {
      restApiName: "SnackGenApi",
      cloudWatchRole: true,
      deployOptions: {
        tracingEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(
          snackApiLogGroup
        ),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
    });

    snackGenApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(snackGeneratorFunc)
    );

  }
}
