import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BlockPublicAccess, Bucket, ObjectOwnership } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { AnyPrincipal } from "aws-cdk-lib/aws-iam";

export class S3WebHostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webHostingBucket = new Bucket(this, "WebHostingBucket", {
      bucketName: `${process.env.NICKNAME}-demo-web-${Math.floor(
        Math.random() * 100000
      )}`,
      //publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error/index.html",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
      }),
      //accessControl: s3.BucketAccessControl.PUBLIC_READ,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    webHostingBucket.grantRead(new AnyPrincipal());

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("./mod05-storage/static-website-example")],
      destinationBucket: webHostingBucket,
    });
  }
}
