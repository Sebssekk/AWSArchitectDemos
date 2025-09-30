# **Networking 2**

This folder will help you demoing some more advanced AWS Networking concepts.

## **Content**
This repo will create for this module
### **VPC Endpoints**
- In `demo-vpc` from [Module 3](../mod03-networking1/README.md) there are 2 **Gateway Endpoints** for S3 and Dynamo.  
  To show them check subnets routing tables. There is one entry for redirect traffic directed to S3 endipoint and one for DynamoDB endpoint
- In `remote-vpc` from [Module 3](../mod03-networking1/README.md) there are 3 **Interface Endpoints** for System Manager, SSM Messages and CloudWatch.  
  To show them check subnets routing tables. There aren't any routes for them.  
  Try to contact (from the `isolated-ec2`) one of those endpoints like `ssm.<AWS_RREGION>.amazonaws.com` and check how it's resolved with a private IP of the vpc instead of a public one. (do the same from your pc or from the other vpc to see the diffence)

### **VPC Peering**
- `vpc-demo` and `remote-vpc` are bound with a **Peering connection**.  
  To demostrate that, you can contact `pub-ec2` on its private address from `isolated-ec2`.  
  Remember to take in consideration their security groups for what traffic is allowed to pass.