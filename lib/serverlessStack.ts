import { Stack, StackProps, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CallAwsService, LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Chain, Choice, Condition, DefinitionBody, Fail, JsonPath, LogLevel, Parallel, Pass, Result, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Code, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { StepFunctionsRestApi } from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import {Function} from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class ServerlessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Step Function

    // https://github.com/aws-samples/step-functions-workflows-collection/tree/main/parallel-translate
    const inputData = new Pass(this, "ToTralsateData", {
      result: Result.fromObject({ data: JsonPath.stringAt("$.data") }),
    });
    const translateToSpanish = new CallAwsService(
      this,
      "TraslateToSpanish",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "es",
          Text: JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const translateToItalian = new CallAwsService(
      this,
      "TraslateToItalian",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "it",
          Text: JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const translateToFrench = new CallAwsService(
      this,
      "TraslateToFrench",
      {
        service: "translate",
        action: "translateText",
        parameters: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "fr",
          Text: JsonPath.stringAt("$.data"),
        },
        iamResources: ["*"],
      }
    );

    const parallel = new Parallel(this, "ParallelTranslate")
      .branch(inputData)
      .branch(translateToItalian)
      .branch(translateToSpanish)
      .branch(translateToFrench);

    new StateMachine(this, "TranslateSfn", {
      stateMachineName: "ParallelTranslate",
      definitionBody: DefinitionBody.fromChainable(parallel),
      timeout: Duration.minutes(5),
      tracingEnabled: true,
    });

    // Simple Flow with Choice

    const lambdaPath = './mod11-serverless/sfn';

    const lambdaProps = {
      runtime: Runtime.NODEJS_LATEST,
      tracing: Tracing.ACTIVE,
    };

    const assignCaseLambda = new Function(this, "assignCaseFunction", {
      ...lambdaProps,
      handler: "assign-case.handler",
      functionName: "sfn_assignCaseLambda",
      code: Code.fromAsset(`${lambdaPath}/assign-case`),
    });

    const closeCaseLambda = new Function(this, "closeCaseFunction", {
      ...lambdaProps,
      handler: "close-case.handler",
      functionName: "sfn_closeCaseLambda",
      code: Code.fromAsset(`${lambdaPath}/close-case`),
    });

    const escalateCaseLambda = new Function(
      this,
      "escalateCaseFunction",
      {
        ...lambdaProps,
        handler: "escalate-case.handler",
        functionName: "sfn_escalateCaseLambda",
        code: Code.fromAsset(`${lambdaPath}/escalate-case`),
      }
    );

    const openCaseLambda = new Function(this, "openCaseFunction", {
      ...lambdaProps,
      handler: "open-case.handler",
      functionName: "sfn_openCaseLambda",
      code: Code.fromAsset(`${lambdaPath}/open-case`),
    });

    const workOnCaseLambda = new Function(this, "workOnCaseFunction", {
      ...lambdaProps,
      handler: "work-on-case.handler",
      functionName: "sfn_workOnCaseLambda",
      code: Code.fromAsset(`${lambdaPath}/work-on-case`),
    });

    const assignCase = new LambdaInvoke(this, "Assign Case", {
      lambdaFunction: assignCaseLambda,
      outputPath: "$.Payload",
    });

    const closeCase = new LambdaInvoke(this, "Close Case", {
      lambdaFunction: closeCaseLambda,
      outputPath: "$.Payload",
    });

    const escalateCase = new LambdaInvoke(this, "Escalate Case", {
      lambdaFunction: escalateCaseLambda,
      outputPath: "$.Payload",
    });

    const openCase = new LambdaInvoke(this, "Open Case", {
      lambdaFunction: openCaseLambda,
      outputPath: "$.Payload",
    });

    const workOnCase = new LambdaInvoke(this, "Work On Case", {
      lambdaFunction: workOnCaseLambda,
      outputPath: "$.Payload",
    });

    const jobFailed = new Fail(this, "Fail", {
      cause: "Engage Tier 2 Support",
    });

    const isComplete = new Choice(this, "Is Case Resolved");

    const chain = Chain.start(openCase)
      .next(assignCase)
      .next(workOnCase)
      .next(
        isComplete
          .when(Condition.numberEquals("$.Status", 1), closeCase)
          .when(
            Condition.numberEquals("$.Status", 0),
            escalateCase.next(jobFailed)
          )
      );

    const simpleWorkflowLogGroup = new LogGroup(this, "SWFLogs", {
      logGroupName: "sfn_simpleWorkflow_log",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const simpleCaseWorkflow = new StateMachine(this, "StateMachine", {
      stateMachineName: "SimpleCaseWorkflow",
      definitionBody: DefinitionBody.fromChainable(chain),
      tracingEnabled: true,
      stateMachineType: StateMachineType.EXPRESS,
      logs: {
        level: LogLevel.ALL,
        destination: simpleWorkflowLogGroup,
      },
    });

    new StepFunctionsRestApi(this, "SimpleCaseWorkflowAPI", {
      restApiName: "simpleCaseWorkflowApi",
      deploy: true,
      stateMachine: simpleCaseWorkflow,
      deployOptions: {
        tracingEnabled: true,
      },
    });


    // SQS + Lambda
    const pieMakerFunction = new Function(this, "PieMakerFunc", {
      runtime: Runtime.PYTHON_3_12,
      code: Code.fromAsset("./mod11-serverless/sqs/pieMakerFunction"),
      handler: "app.lambda_handler",
      tracing: Tracing.ACTIVE,
      functionName: "pieMakerFunction",
    });

    const pieOrderQueueDLQ = new Queue(this, "PieOrderQueueDLQ", {
      queueName: "pieOrderDLQ",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const pieOrderQueue = new Queue(this, "PieOrderQueue", {
      queueName: "pieOrder",
      removalPolicy: RemovalPolicy.DESTROY,
      // Avoid duplicate delivery while a batch is still being processed.
      visibilityTimeout: Duration.minutes(5),
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
