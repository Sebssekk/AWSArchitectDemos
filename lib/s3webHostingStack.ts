import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { AnyPrincipal } from "aws-cdk-lib/aws-iam";

export class S3WebHostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webHostingBucket = new s3.Bucket(this, "WebHostingBucket", {
      bucketName: `${process.env.NICKNAME}-demo-web-${Math.floor(
        Math.random() * 100000
      )}`,
      //publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error/index.html",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
      }),
      //accessControl: s3.BucketAccessControl.PUBLIC_READ,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
    });

    webHostingBucket.grantRead(new AnyPrincipal());

    const webDeployment = new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./mod05-storage/static-website-example")],
      destinationBucket: webHostingBucket,
    });
  }
}
