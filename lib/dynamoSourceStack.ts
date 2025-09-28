import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";

import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class DynamoSourceStack extends Stack {
  public readonly sourceBucket: Bucket
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.sourceBucket = new Bucket(this, "DynamoSourceBucket", {
      bucketName: `employee-table-source-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true, 
    })

    new BucketDeployment(this, "DynamoSourceUploading", {
      sources: [Source.asset("./mod06-database/dynamo/dynamoStarter")],
      destinationBucket: this.sourceBucket
    })
  }
}