import {  Stack, StackProps, SecretValue, RemovalPolicy, CfnOutput,  } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ArnPrincipal, CfnAccessKey, Effect, ManagedPolicy, PolicyStatement, Role, User } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';


export class PermissionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAM Policy to allow List and getObject from sebs* buckets
    const demoBucketPolicy = new ManagedPolicy(this, "DemoBucketPolicy", {
      managedPolicyName: "demoBucketPolicy",
      statements: [ 
        new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject','s3:ListBucket'],
        resources: ['arn:aws:s3:::*demo*', `arn:aws:s3:::${process.env.NICKNAME}-demo*/*`],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['iam:ListRoles'],
          resources: ['*'],
        })
      ]
    })

    //Boundary Permission Policy to DENY access to 'permission' s3 prefix
    const demoBoundary = new ManagedPolicy(this, "DemoBoundary",{
      managedPolicyName: "demoBoundary",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:List*', 's3:Get*', 's3:Describe*'],
          resources: [ '*'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['iam:ListRoles'],
          resources: ["*"]
        })
      ]
    })

    // demo IAM User with Previous policy and permission attached
    const demoUser = new User(this, 'DemoUser',{
      userName: "demo-user",
      password: SecretValue.unsafePlainText("test1234!"),
      managedPolicies: [demoBucketPolicy],
      permissionsBoundary: demoBoundary,
    });

    // demo user Key for prgrammatic Access 
    const accessKey = new CfnAccessKey(this, 'CfnDemoAccessKey', {
        userName: demoUser.userName,
    });
    new CfnOutput(this, 'DemoUser-accessKeyId', { value: accessKey.ref });
    new CfnOutput(this, 'DemoUser-secretAccessKey', { value: accessKey.attrSecretAccessKey });

    // a Demo bucket 
    const demoBucket = new Bucket(this, 'DemoPrivateBucket',{
      bucketName: `${process.env.NICKNAME}-demo-private-${Math.floor(Math.random() * 100000)}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    // Bucket ACL to Deny get objects from previous bucket to demo user
    demoBucket.addToResourcePolicy( new PolicyStatement({
      effect: Effect.DENY,
      principals: [new ArnPrincipal(demoUser.userArn)],
      actions: ['s3:GetObject'],
      resources: [demoBucket.arnForObjects("*")]
    }))

    // demo contentent for previous bucket
    new BucketDeployment(this, "DemoDeployment", {
      sources: [Source.asset("mod02-iam/downloadMe")],
      destinationBucket: demoBucket
    })

    // a Role with Admin rights
    const demoAdminRole = new Role(this, 'DemoAdminRole', {
      roleName: 'demoAdminRole',
      assumedBy: new ArnPrincipal(demoUser.userArn),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
      permissionsBoundary: demoBoundary,
    });
  }
}