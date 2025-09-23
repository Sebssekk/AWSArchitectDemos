# **Exploring IAM**

This folder will help you demoing IAM concepts in AWS

## **Content**
This repo will create for this module
- a **IAM User** called `demo-user` with a console password `test1234!`  
- Credentials for non interactive access (*ACCESS_KEY_ID* and *SECRET_ACCESS_KEY*) will be also generated and printed in the project creation output
- This user has **IAM policy** allowing it to list buckets and objects any bucket with `demo` in the bucket name and get their objects
- This user has a **Permission Boundary** that will limit the user to have access only to s3 (List,Get and Describe)
- an **S3 Bucket** called `<NICKNAME>-demo-private-<RANDOM_NUM>` with a `downloadMe.txt` file inside
- The private bucket has a **Resource Based Policy** to <u>DENY</u> `demo-user` to get any objects
- an **IAM Role** called `demoAdminRole` that can be assumed by `demo-user` with the `AdministratorAccess` Managed Policy
- the role has the same **Boundary** of the user 

## **Instructions**
This demo can be done both on the Console and on the CLI.  
1. ### **Permission Test**
    To test the IAM permissions
    - Assume the `demo-user` identity (via AWS console with username/password or via cli)  
    - Try to list all buckets (⛔**NO** PERMISSION to see them all -> IAM POLICY)
    - Try to list all objects of *demo-public* bucket (✅OK PERMISSION -> IAM POLICY)
    - Try to download an object from *demo-public* bucket (✅OK PERMISSION -> IAM POLICY)
    - Try to download an object from *private-public* bucket (⛔**NO** PERMISSION -> RB POLICY of bucket)  

*NOTE. The script [`permission-test.sh`](../mod02-iam/permission-test.sh) or [`permission-test.ps1`](../mod02-iam/permission-test.ps1) contains commands to follow these previous steps via cli*  

2. ### **Role Assumption**
    Now as `demo-user` it's possible to assume the role `demoAdminRole`
    - Assume the role `demoAdminRole` (via AWS console or via cli)
    - Try to list all buckets (✅OK PERMISSION to see them all -> ROLE IAM POLICY)
    - Try to list all objects of *demo-public* bucket (✅OK PERMISSION -> ROLE IAM POLICY)
    - Try to download an object from *demo-public* bucket (✅OK PERMISSION -> ROLE IAM POLICY)
    - Try to download an object from *private-public* bucket (✅OK PERMISSION -> ROLE RB POLICY of bucket)  

    - As the role is an admin role... Try to list ec2 (⛔**NO** PERMISSION -> Permission Boundary)

*NOTE. The script [`assume-role.sh`](../mod02-iam/assume-role.sh) or [`assume-role.ps1`](../mod02-iam/assume-role.ps1) contains commands to assume the role via cli*