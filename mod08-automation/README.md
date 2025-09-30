# **Automation**

This folder will help you demoing some Automation features in AWS.

## **Content**
This repo will provide this [folder](./).  
Inside you can find 2 files for a **Cloud Formation demo**
- [`ec2.yaml`](./ec2.yaml)  
  This file can be use as an example of *Cloud Formation* Stack file.  
  Once loaded will create an EC2 instance with a KeyPair and a Security Group.  
  This template file is parametrized so it can be completed on the Cloud Formation console
- [`ec2_import.yaml`](./ec2_import.yaml)  
  This file has been thought to demo the capability of CloudFormation to import existing resources.  
  This file will create a Stack importing an EC2 instance.  
  ***Note.** The EC2 instance should have already been manually created, maybe from a console demo during [Module 4](../mod04-compute/README.md)*

Moreover all this project can be used as a demostration of what **CDK** is and how it works