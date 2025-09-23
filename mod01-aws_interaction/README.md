# **Interacting with AWS**

This folder will help you demoing aws intereactions via console, cli and sdk

## **Instructions**
### **Console**
1. Login to AWS console
2. Explore dashboard
### **CLI**
0. Open a terminal to this repo root folder.
1. Change directory to *demo-cli*
    ```
    cd mod01-aws_interaction/demo-cli
    ```
2. Demo s3 bucket creation via cli using the content of
    - `s3.sh` in LINUX shell
    - `s3.ps1` in a WINDOWS powershell
  This will create an s3 bucket PUBLICLY readable
3. Demo another aws service, **[Amazon Polly](https://aws.amazon.com/polly)** via cli using the content of
    - `polly.sh` in LINUX shell
    - `polly.ps1` in a WINDOWS powershell  

    This script will start from a text and will use the **Polly** service to synthetize an MP3 from that.  
    Then it will upload the file on the previously created public bucket printing the resulting url so that every participants can open the audio file from their browser and listen to it.
### **SDK**
0. Open a terminal to this repo root folder.
1. Change directory to *demo-sdk*
    ```
    cd mod01-aws_interaction/demo-sdk
    ```
*NOTE. This folder contains examples in Java, Python and Node.*  
*Pick the one you preferer/know or feel free to add new ones*  

2. Install dependencies (<u>It depends on chosen language</u>)
3. Run the chosen language code
    - The Python code will traslate a text and upload it to the previously created public bucket
    - The JAVA code will list the content of the previously created public bucket
    - The JS code will download the translated file uploaded from the python script

## **Clean up**
When you're ready to clean resources you can 
0. Open a terminal to this repo root folder.
1. Change directory to *demo-cli*
    ```
    cd mod01-aws_interaction/demo-cli
    ```
2. run the script
    - `clean.sh` in LINUX shell
    - `clean.ps1` in a WINDOWS powershell  

    This will delete the public bucket, its content and all the downloaded/created local files from previous scripts 