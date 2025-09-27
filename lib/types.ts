import { StackProps } from "aws-cdk-lib";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

export interface VpcsStackProps extends StackProps {
    vpc1: Vpc,
    vpc2: Vpc,
}
export interface VpcAndSGStackProps extends StackProps {
    vpc: Vpc,
    sg: SecurityGroup,
}