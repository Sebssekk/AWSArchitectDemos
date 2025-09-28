import {
  Stack,
  StackProps,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, Architecture, Code, LayerVersion, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { AccessLogFormat, LambdaIntegration, LogGroupLogDestination, RestApi } from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { AwsCliLayer } from "aws-cdk-lib/lambda-layer-awscli";

export class APIAndLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- snackGenerator Function ---

    const snackApiLogGroup = new LogGroup(this, "PrdLogs", {
      logGroupName: "snackGenFunc_prod_log",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const demoLayer = new LayerVersion(this, "DemoLayer", {
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset("./mod04-compute/demoLayer"),
      compatibleArchitectures: [
        Architecture.X86_64,
        Architecture.ARM_64,
      ],
      compatibleRuntimes: [Runtime.NODEJS_LATEST],
    });

    const snackGeneratorFunc = new Function(this, "SnackgenFunc", {
      functionName: "snackGeneratorFunction",
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromAsset("./mod04-compute/snackGenerator"),
      tracing: Tracing.ACTIVE,
      layers: [demoLayer, new AwsCliLayer(this, "AWSCliLayer")],
    });

    const snackGenApi = new RestApi(this, "SnackGenApi", {
      restApiName: "SnackGenApi",
      cloudWatchRole: true,
      deployOptions: {
        tracingEnabled: true,
        accessLogDestination: new LogGroupLogDestination(
          snackApiLogGroup
        ),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
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
      new LambdaIntegration(snackGeneratorFunc)
    );

  }
}
