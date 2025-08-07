import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class S3NotificationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // S3 Object notication
    const translatorFnRole = new iam.Role(this, "TranslatorFnRole", {
      roleName: "translator-fn-role",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("TranslateFullAccess"),
      ],
    });

    const translatingBucket = new s3.Bucket(this, "TranslatingBucket", {
      bucketName: `${
        process.env.NICKNAME
      }-demo-translating-bucket-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const translatingFunction = new lambda.Function(
      this,
      "TranslatingFunction",
      {
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: "main.handler",
        code: lambda.Code.fromAsset("./mod05-storage/translate-lambda"),
        environment: {
          SourceLanguageCode: "en",
          TargetLanguageCode: "it",
          OutputBucket: translatingBucket.bucketName,
        },
        role: translatorFnRole,
        functionName: "translator-function",
      }
    );

    translatingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(translatingFunction),
      {
        suffix: ".txt",
        prefix: "toTranslate/",
      }
    );

    const translateCompleteTopic = new sns.Topic(
      this,
      "TranslateCompleteTopic",
      {
        topicName: "translateComplete",
        displayName: "Tranlsate Complete",
      }
    );

    new sns.Subscription(this, "MyEmailSub", {
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: `${process.env.EMAIL}`,
      topic: translateCompleteTopic,
    });
    
    const demoQueue = new sqs.Queue(this, "DemoQueue", {
      queueName: "demo-queue",
      removalPolicy: RemovalPolicy.DESTROY
    })

    new sns.Subscription(this, "SQSSub", {
      protocol: sns.SubscriptionProtocol.SQS,
      topic: translateCompleteTopic,
      endpoint: demoQueue.queueArn
    })

 
    translatingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(translateCompleteTopic),
      {
        suffix: ".txt",
        prefix: "translated/",
      }
    );
    const translateDeployment = new s3deploy.BucketDeployment(
      this,
      "DeployTranslateFolder",
      {
        sources: [
          s3deploy.Source.data("toTranslate/hello.txt", "hello, world!"),
        ],
        destinationBucket: translatingBucket,
      }
    );
  }
}
