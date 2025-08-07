import { StackProps } from "aws-cdk-lib";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

export interface VpcStackProps extends StackProps {
    vpc: Vpc,
    vmSg? : SecurityGroup
}