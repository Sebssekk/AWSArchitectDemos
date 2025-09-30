# **Containers**

This folder will help you demoing some Containers solutions in AWS.

## **Content**
This repo will create for this module
- An **ECS** cluster
- With a **Service** exposing port 80
- With a **Task Definition** using an image from **ECR**
- An **ECR** Repository 
- A **CodeCommit** repository with Docker image source code
- A **CodeBuild** project to build the repository code and push it to ECR
- A **CodePipeline** to bind CodeCommit, CodeBuild and build the image
- A **Load Balancer** on top of ECS Service to expose it  

**Note.** Even if the pipeline is deleted (using `cdk destroy --all`) a bucket generated to store its artifacts will persist.  
To clean it you can use this [bash script](clean.sh) or this [powershell script](./clean.ps1) at the end of the class.
