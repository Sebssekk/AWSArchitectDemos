import { Stack, StackProps, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sfn_task from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class ServerlessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Step Function

    // https://github.com/aws-samples/step-functions-workflows-collection/tree/main/parallel-translate
    const inputData = new sfn.Pass(this, "ToTralsateData", {
      result: sfn.Result.fromObject({ data: sfn.JsonPath.stringAt("$.data") }),
    });
    const translateToSpanish = new sfn_task.CallAwsService(
      this,
      "TraslateToSpanish",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "es",
          Text: sfn.JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const translateToItalian = new sfn_task.CallAwsService(
      this,
      "TraslateToItalian",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "it",
          Text: sfn.JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const translateToFrench = new sfn_task.CallAwsService(
      this,
      "TraslateToFrench",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "fr",
          Text: sfn.JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const parallel = new sfn.Parallel(this, "ParallelTranslate")
      .branch(inputData)
      .branch(translateToItalian)
      .branch(translateToSpanish)
      .branch(translateToFrench);

    new sfn.StateMachine(this, "TranslateSfn", {
      stateMachineName: "ParallelTranslate",
      definition: parallel,
      timeout: Duration.minutes(5),
      tracingEnabled: true,
    });

    // Simple Flow with Choice

    const lambdaPath = './mod11-serverless/sfn';

    const lambdaProps = {
      runtime: Runtime.NODEJS_LATEST,
      tracing: Tracing.ACTIVE,
    };

    const assignCaseLambda = new lambda.Function(this, "assignCaseFunction", {
      ...lambdaProps,
      handler: "assign-case.handler",
      functionName: "sfn_assignCaseLambda",
      code: lambda.Code.fromAsset(`${lambdaPath}/assign-case`),
    });

    const closeCaseLambda = new lambda.Function(this, "closeCaseFunction", {
      ...lambdaProps,
      handler: "close-case.handler",
      functionName: "sfn_closeCaseLambda",
      code: lambda.Code.fromAsset(`${lambdaPath}/close-case`),
    });

    const escalateCaseLambda = new lambda.Function(
      this,
      "escalateCaseFunction",
      {
        ...lambdaProps,
        handler: "escalate-case.handler",
        functionName: "sfn_escalateCaseLambda",
        code: lambda.Code.fromAsset(`${lambdaPath}/escalate-case`),
      }
    );

    const openCaseLambda = new lambda.Function(this, "openCaseFunction", {
      ...lambdaProps,
      handler: "open-case.handler",
      functionName: "sfn_openCaseLambda",
      code: lambda.Code.fromAsset(`${lambdaPath}/open-case`),
    });

    const workOnCaseLambda = new lambda.Function(this, "workOnCaseFunction", {
      ...lambdaProps,
      handler: "work-on-case.handler",
      functionName: "sfn_workOnCaseLambda",
      code: lambda.Code.fromAsset(`${lambdaPath}/work-on-case`),
    });

    const assignCase = new sfn_task.LambdaInvoke(this, "Assign Case", {
      lambdaFunction: assignCaseLambda,
      outputPath: "$.Payload",
    });

    const closeCase = new sfn_task.LambdaInvoke(this, "Close Case", {
      lambdaFunction: closeCaseLambda,
      outputPath: "$.Payload",
    });

    const escalateCase = new sfn_task.LambdaInvoke(this, "Escalate Case", {
      lambdaFunction: escalateCaseLambda,
      outputPath: "$.Payload",
    });

    const openCase = new sfn_task.LambdaInvoke(this, "Open Case", {
      lambdaFunction: openCaseLambda,
      outputPath: "$.Payload",
    });

    const workOnCase = new sfn_task.LambdaInvoke(this, "Work On Case", {
      lambdaFunction: workOnCaseLambda,
      outputPath: "$.Payload",
    });

    const jobFailed = new sfn.Fail(this, "Fail", {
      cause: "Engage Tier 2 Support",
    });

    const isComplete = new sfn.Choice(this, "Is Case Resolved");

    const chain = sfn.Chain.start(openCase)
      .next(assignCase)
      .next(workOnCase)
      .next(
        isComplete
          .when(sfn.Condition.numberEquals("$.Status", 1), closeCase)
          .when(
            sfn.Condition.numberEquals("$.Status", 0),
            escalateCase.next(jobFailed)
          )
      );

    const simpleWorkflowLogGroup = new logs.LogGroup(this, "SWFLogs", {
      logGroupName: "sfn_simpleWorkflow_log",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const simpleCaseWorkflow = new sfn.StateMachine(this, "StateMachine", {
      stateMachineName: "SimpleCaseWorkflow",
      definition: chain,
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        level: sfn.LogLevel.ALL,
        destination: simpleWorkflowLogGroup,
      },
    });

    new apigateway.StepFunctionsRestApi(this, "SimpleCaseWorkflowAPI", {
      restApiName: "simpleCaseWorkflowApi",
      deploy: true,
      stateMachine: simpleCaseWorkflow,
      deployOptions: {
        tracingEnabled: true,
      },
    });


    // SQS + Lambda
    const pieMakerFunction = new lambda.Function(this, "PieMakerFunc", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("./mod11-serverless/sqs/pieMakerFunction"),
      handler: "app.lambda_handler",
      tracing: lambda.Tracing.ACTIVE,
      functionName: "pieMakerFunction",
    });

    const pieOrderQueueDLQ = new Queue(this, "PieOrderQueueDLQ", {
      queueName: "pieOrderDLQ",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const pieOrderQueue = new Queue(this, "PieOrderQueue", {
      queueName: "pieOrder",
      removalPolicy: RemovalPolicy.DESTROY,
      deadLetterQueue: {
        queue: pieOrderQueueDLQ,
        maxReceiveCount: 2,
      },
    });

    pieMakerFunction.addEventSource(
      new SqsEventSource(pieOrderQueue, {
        batchSize: 3,
        reportBatchItemFailures: true,
        maxBatchingWindow: Duration.minutes(1),
      })
    );


  }
}
