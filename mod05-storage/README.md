# **Storage Solutions**

This folder will help you demoing Storage Solutions in AWS (**[S3](https://aws.amazon.com/s3)** and **[EFS](https://aws.amazon.com/efs)**)

## **Content**
This repo will create for this module
### **S3 & Event Notification**
- a **S3 Bucket** named `<NICKNAME>-demo-translating-bucket-<RANDOM_NUM>`
- This bucket has an event Notification. Every time a .txt file with english content is uploaded in the folder `toTranslate` a Lambda function is triggered.
- A `translator-function` that takes the content of the bucket, translate it to itailan and re upload a new .txt file in a `translated` folder of the same bucket.
- A second event notification will send a message to a **SNS Topic**  named `translateComplete`
- An email subscription is bound to this Topic (with the email specified as ***env***)
- An **SQS Queue** as a second subscription to that topic
### S3 Web Hosting
- a public `S3 Bucket` named `<NICKNAME>-demo-web-<RANDOM_NUM>` with web hosting enabled and a static web site inside
### EFS
- an **EFS** File system called `demo-fs` attached to the `demo-vpc` private subnets and the *anonymous access* allowed
- Mount the file system from the `priv-ec2` (from [Module 3](../mod03-networking1/README.md)) with `mount -t nfs4 <EFS_DNS>:/ /<target_folder>`