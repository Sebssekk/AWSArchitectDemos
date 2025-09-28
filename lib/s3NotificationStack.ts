import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { LambdaDestination, SnsDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Subscription, SubscriptionProtocol, Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";

export class S3NotificationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // S3 Object notication
    const translatorFnRole = new Role(this, "TranslatorFnRole", {
      roleName: "translator-fn-role",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
        ManagedPolicy.fromAwsManagedPolicyName("TranslateFullAccess"),
      ],
    });

    const translatingBucket = new Bucket(this, "TranslatingBucket", {
      bucketName: `${
        process.env.NICKNAME
      }-demo-translating-bucket-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const translatingFunction = new Function(
      this,
      "TranslatingFunction",
      {
        runtime: Runtime.NODEJS_LATEST,
        handler: "main.handler",
        code: Code.fromAsset("./mod05-storage/translate-lambda"),
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
      EventType.OBJECT_CREATED,
      new LambdaDestination(translatingFunction),
      {
        suffix: ".txt",
        prefix: "toTranslate/",
      }
    );

    const translateCompleteTopic = new Topic(
      this,
      "TranslateCompleteTopic",
      {
        topicName: "translateComplete",
        displayName: "Tranlsate Complete",
      }
    );

    new Subscription(this, "MyEmailSub", {
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: `${process.env.EMAIL}`,
      topic: translateCompleteTopic,
    });
    
    const demoQueue = new Queue(this, "DemoQueue", {
      queueName: "demo-queue",
      removalPolicy: RemovalPolicy.DESTROY
    })

    new Subscription(this, "SQSSub", {
      protocol: SubscriptionProtocol.SQS,
      topic: translateCompleteTopic,
      endpoint: demoQueue.queueArn
    })

 
    translatingBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SnsDestination(translateCompleteTopic),
      {
        suffix: ".txt",
        prefix: "translated/",
      }
    );
    const translateDeployment = new BucketDeployment(
      this,
      "DeployTranslateFolder",
      {
        sources: [
          Source.data("toTranslate/hello.txt", "hello, world!"),
        ],
        destinationBucket: translatingBucket,
      }
    );
  }
}
