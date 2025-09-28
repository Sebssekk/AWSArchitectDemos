import {  RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AttributeType, InputFormat, ProjectionType, Table} from "aws-cdk-lib/aws-dynamodb"
import { DynamoSourceStackProps } from './types';
export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props?: DynamoSourceStackProps) {
    super(scope, id, props);

    const simpleTable = new Table(this, "SimpleTable", {
        tableName: "Employee",
        partitionKey: { name: 'LoginAlias', type: AttributeType.STRING },
        sortKey: { name: 'ManagerLoginAlias', type: AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
        importSource: {
          bucket: props!.sourceBucket,
          inputFormat: InputFormat.csv({
            delimiter: ','
          })
        }
    })

    simpleTable.addGlobalSecondaryIndex({
      indexName: 'findByName',
      partitionKey:{
        name: 'FirstNAme',
        type: AttributeType.STRING
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes:['Skills']
    })
  }
}
