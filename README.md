# Welcome to this CDK project for AWS Solution Architect Associate

## **Abstract**

_**Disclaimer**: Please note that executing this project could end in charging your account. Check what you're going to build_

This project was created to support the delivery of a _Architecting on AWS_ course using cdk (TypeScript).  
The **_cdk_** utility will create for you preconfigured services to enrich with live demos the explaination.

## **Prerequisites**

To fully use this project you'll need to configure

- **awscli** --> [installation instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)  
   Once you have installed it you need to configure the awscli

  ```bash
  $ aws configure
  ```

  **_Administrator_** rights are required to bootstrap the infrastructure

- **cdk**  
   To install cdk you should have _npm_ and _node.js_ **v12+**  
   Than you can install it with
  ```bash
  $ npm install -g aws-cdk
  ```
- **python/node runtimes** if you want to run every sdk example in the project  
  Versions used during the creation:

  - Python 3.10.11
  - Node v24.4.1

- **Docker**  
  (To build and upload a demo docker image to ***ECR***)

## **Bootstrap Resources**

Before the course start the project must be bootstrapped to prepare resources.

1. Customize your Stack **modifying variables in `.env` file**

- _NICKNAME_ - to have a personalization in buckets name
- _EMAIL_ - to use as a subscription of SNS topic

2. Dependencies preparation.  
   From the root directory of the project run the command

   ```bash
   $ npm install
   ```

3. **_cdk_** preparation.  
   In order to let cdk create resources on your account the utility must be initialized.  
   From the root directory of the project run the command
   ```bash
   $ cdk bootstrap
   ```
   Ensure your _awscli_ is configured with administrator rights for this command to succed
4. **_cdk_** deploy.  
   To actually create _CloudFormation_ Stacks with wanted resources
   ```bash
   $ cdk deploy --all
   ```
5. An email will be sent to the configured address in _.env_ file.  
   Check it and confirm the subscription in order to receive future SNS Topic messagges

## **How to Use the project**

A step by step guide on how to use demos during the course modules

### TODO

..................................

## **Clean up**

To destroy everything that was created by cdk

```bash
$ cdk destroy --all
```

Moreover some resources were created during module 3 and module 6. Those can be deleted with

```bash
$ cd mod01-aws_interaction/demo-cli
$ bash clean.sh
```

Any other resource created manually during the course won't be seen by cdk and you'll need to delete them manually
