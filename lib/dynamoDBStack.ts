import {  RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AttributeType, InputFormat, ProjectionType, Table} from "aws-cdk-lib/aws-dynamodb"
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamoSourceBucket = new Bucket(this, "DynamoSourceBucket", {
      bucketName: `employee-table-source-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true, 
    })

    new BucketDeployment(this, "DynamoSourceUploading", {
      sources: [Source.asset("./mod06-database/dynamo/dynamoStarter")],
      destinationBucket: dynamoSourceBucket
    })

    const simpleTable = new Table(this, "SimpleTable", {
        tableName: "Employee",
        partitionKey: { name: 'LoginAlias', type: AttributeType.STRING },
        sortKey: { name: 'ManagerLoginAlias', type: AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
        importSource: {
          bucket: dynamoSourceBucket,
          inputFormat: InputFormat.csv({
            delimiter: ','
          })
        }
    })

    simpleTable.addLocalSecondaryIndex( {
      indexName: 'OrderByName',
      sortKey: {
        name: 'FirstName',
        type: AttributeType.STRING,
      },
      nonKeyAttributes: ['Skills'],
      projectionType: ProjectionType.INCLUDE,
    })
  }
}
