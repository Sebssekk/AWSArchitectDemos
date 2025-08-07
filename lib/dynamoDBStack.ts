import {  RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from "aws-cdk-lib/aws-dynamodb"

export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const simpleTable = new dynamo.Table(this, "SimpleTable", {
        tableName: "Employee",
        partitionKey: { name: 'LoginAlias', type: dynamo.AttributeType.STRING },
        sortKey: { name: 'ManagerLoginAlias', type: dynamo.AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
    })

    simpleTable.addLocalSecondaryIndex( {
      indexName: 'OrderByName',
      sortKey: {
        name: 'FirstName',
        type: dynamo.AttributeType.STRING,
      },
      nonKeyAttributes: ['Skills'],
      projectionType: dynamo.ProjectionType.INCLUDE,
    })
  }
}
