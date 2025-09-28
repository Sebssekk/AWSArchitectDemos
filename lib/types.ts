import { StackProps } from "aws-cdk-lib";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
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