import { StackProps } from "aws-cdk-lib";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Bucket } from "aws-cdk-lib/aws-s3";

export interface VpcsStackProps extends StackProps {
    vpc1: Vpc,
    vpc2: Vpc,
}
export interface VpcAndSGStackProps extends StackProps {
    vpc: Vpc,
    sg: SecurityGroup,
}
export interface DynamoSourceStackProps extends StackProps {
    sourceBucket: Bucket,
}

export interface ECRStackProps extends StackProps {
    ecrRepo: Repository,
}