# **Compute**

This folder will help you demoing basic Compute solutions in AWS: [**AWS EC2**](https://aws.amazon.com/ec2) and [**AWS Lambda**](https://aws.amazon.com/lambda)

## **Content**
This repo will create for this module
### **AWS EC2**
All resources (*EC2 Instances*) from [Module 3](../mod03-networking1/README.md)

### **AWS Lambda**
- a **Lambda Function** called `snackGeneratorFunction`  
- an **API Gateway** called `SnackGenApi` with logging enabled


The API Gateway exposes the Lambda function via a `GET` method at the root endpoint.  
Whenerver the lambda is triggered it also writes a json file in a bucket called `<NICKNAME>-snacks-<RANDOM_NUM>`

---  
**Moreover** The Lambda function has a *Layer*. Every time the Lambda is invoked the function will print in the log the content of `/opt` folder where layers are mounted
