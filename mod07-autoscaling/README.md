# **Monitor & Scaling**

This folder will help you demoing Observability features in AWS, Loadbalancing and Autoscaling.

## **Content**
This repo will create for this module

### **Observability**
- All resources in this project will generate some logs who can be explored in **[AWS Cloudwatch](https://aws.amazon.com/cloudwatch) Logs**
- All resources in this project will generate some metrics who can be explored in **[AWS Cloudwatch](https://aws.amazon.com/cloudwatch) Metrics**. It's also possible to configure some allarms from them.
- Some resources will also generate traces, who are visible in the **[AWS Xray](https://aws.amazon.com/xray)** console, like the `snack-generator-function` from [Module 5](../mod04-compute/README.md) where it's possible to see all components of a call (`API Gateway --> Lambda Service --> Lambda Function --> S3 Bucket`)

### **Load Balancer & Autoscaling**
- An Autoscaling Group named `demo-asg` made from a **launch template**
- This launch-template will create Amazon Linux 2023 vm on the private subnet ( from [Module 3](../mod03-networking1/README.md) )exposing a web application on port 80 (The application is a Docker container installed via UserData)
- The Autoscaling policy is based on CPU load (+50%)
- An Application Load Balancer named `demo-alb` in front of the ASG listening on port HTTP port 80
- The ALB has also an health check on http port 80 of target machines  

***Note.** All vms are accessible via SSM*  

The web application will show the IP and HOSTNAME of the machine, so it's possible to highlight the load balance among them.