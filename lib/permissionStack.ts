import {  Stack, StackProps, SecretValue, RemovalPolicy, CfnOutput,  } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';


export class PermissionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAM Policy to allow List and getObject from sebs* buckets
    const demoBucketPolicy = new iam.ManagedPolicy(this, "DemoBucketPolicy", {
      managedPolicyName: "demoBucketPolicy",
      statements: [ 
        new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject','s3:ListBucket'],
        resources: ['arn:aws:s3:::*demo*', `arn:aws:s3:::${process.env.NICKNAME}-demo*/*`],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['iam:ListRoles'],
          resources: ['*'],
        })
      ]
    })

    //Boundary Permission Policy to DENY access to 'permission' s3 prefix
    const demoBoundary = new iam.ManagedPolicy(this, "DemoBoundary",{
      managedPolicyName: "demoBoundary",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:List*', 's3:Get*', 's3:Describe*'],
          resources: [ '*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['iam:ListRoles'],
          resources: ["*"]
        })
      ]
    })

    // demo IAM User with Previous policy and permission attached
    const demoUser = new iam.User(this, 'DemoUser',{
      userName: "demo-user",
      password: SecretValue.unsafePlainText("test1234!"),
      managedPolicies: [demoBucketPolicy],
      permissionsBoundary: demoBoundary,
    });

    // demo user Key for prgrammatic Access 
    const accessKey = new iam.CfnAccessKey(this, 'CfnDemoAccessKey', {
        userName: demoUser.userName,
    });
    new CfnOutput(this, 'DemoUser-accessKeyId', { value: accessKey.ref });
    new CfnOutput(this, 'DemoUser-secretAccessKey', { value: accessKey.attrSecretAccessKey });

    // a Demo bucket 
    const demoBucket = new s3.Bucket(this, 'DemoPrivateBucket',{
      bucketName: `${process.env.NICKNAME}-demo-private-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    // Bucket ACL to Deny get objects from previous bucket to demo user
    demoBucket.addToResourcePolicy( new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      principals: [new iam.ArnPrincipal(demoUser.userArn)],
      actions: ['s3:GetObject'],
      resources: [demoBucket.arnForObjects("*")]
    }))

    // demo contentent for previous bucket
    new s3deploy.BucketDeployment(this, "DemoDeployment", {
      sources: [s3deploy.Source.asset("mod02-iam/downloadMe")],
      destinationBucket: demoBucket
    })

    // a Role with Admin rights
    const demoAdminRole = new iam.Role(this, 'DemoAdminRole', {
      roleName: 'demoAdminRole',
      assumedBy: new iam.ArnPrincipal(demoUser.userArn),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
      permissionsBoundary: demoBoundary,
    });
  }
}