# **Networking 1**

This folder will help you demoing basic network services (***Virtual Private Cloud***) in AWS

## **Content**
This repo will create for this module
### **Networks**
- a **VPC** called `demoVpc` with
    - 4 subnets (2 public - 2 private)
    - Internet Gateway 
    - Nat Gateway
    - Routing tables
        - Public one with igw as default
        - Private one with natgw as default
        - A Gateway endpoint for S3
- a **VPC** called `demoIsolatedVpc` with
    - 1 subnet ISOLATED
    - 1 Routing table
    - interface endpoints for
        - Cloud watch
        - System Manager

### **EC2** (to test networks)
- A `pub-sg` **Security Group** allowing SSH, HTTP, HTTPS, RDP from anywhere
- A `priv-sg` **Security Group** allowing HTTPS from anywhere
- A `interface-ep-sg` **Security Group** allowing only traffic from isolated vpc
- A **IAM Role** for accessing System Manager
- 4 **EC2 Instances**
    - `pub-ec2` a publicly accessible Linux VM with  with SSM Role and pub-sg
    - `pub-ec2-win` a publicly accessible Windows VM with SSM Role and pub-sg
    - `priv-ec2` a Linux VM in the private subnet with priv-sg and SSM Role
    - `isolated-ec2` a VM in the ISOLATED VPC with isolated sg and ssm Role  


**TO CONNECT TO INSTANCES** is possible to use the sytem manager for ALL of them.  
It's also possible 
- For `pub-ec2` connect via ssh with  
    ```bash
    ssh -i demo-lin-key.pem ec2-user@<PUBLIC-IP>
    ```
- For `pub-ec2-win` connect via rdp using `Administrator` as user name and retrieve the password from the console using `demo-win-key.pem`

**TO GET PEM KEYS** you can use the script [retrieve-ec2-keys.sh](./retrieve-ec2-keys.sh) or [retrieve-ec2-keys.ps1](./retrieve-ec2-keys.ps1).  
Both scripts will generate files `demo-lin-key.pem` and `demo-win-key.pem` in this folder.

## **Some possible demoes**
- Explore VPC created resources
- Connect to a public instance via public IP 
- Connect to the private instance via System manager and contact "Internet"
- Connect to the ISOLATED instance, contact internet AND try to resolve endpoints of System Manager and Cloud  like `ssm.<AWS_RREGION>.amazonaws.com`