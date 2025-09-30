# **Serverless**

This folder will help you demoing some AWS Serverless services.

## **From Previous Module**
- A **REST API Gateway** has been created in [Module 4](../mod04-compute/README.md) (called `SnackGenApi`) in front of a Lambda function 
- A **SNS Topic** has been created in [Module 5](../mod05-storage/README.md) (called `translateComplete`) capturing S3 event with 2 subscription
    - an email address
    - an **SQS Queue** (called `demo-queue`) where messages persist until consumed

## **Content**
This repo will create for this module 
### **SQS**
- An **SQS Queue** called `pieOrder`
- A python [script](./sqs/populate-sqs.py) to populate that.  
  *[ Note that to run it you need to have Python installed and than install needed [dependencies](./sqs/requirements.txt) globally or in a Virtual Env ]*
- A **Lambda Function** Consuming the Queue.
    - If the message is not processable, the Lambda function will send it to a **Dead Letter Queue** called `pieOrderDLQ`  
    (To see DLQ messages POLL for them!)
### **Step Functions**
- A step function called `ParallelTranslate` who will take an input in english and will translate that in multiple languages
    - To use it click on `Start Execution` on the console and in the json text area put something like this
      ```json
      {
        "data": "This is just a test"
      }
      ```
- A step function called `SimpleCaseWorkflow` who will chain multiple Lambda functions simulating a Workflow logic
    - To use it click on `Start Execution` on the console and in the json text area put something like this
      ```json
      { 
        "Case": "001", 
        "Message": "Case 001: opened..." 
      }
      ```
    - There is also an API Gateway on top of this State Machine (called `simpleCaseWorkflowApi`) so it's also possible to trigger the Step function with an api call like  
      ```bash
      curl --request POST --url <API_GW_ENDPOINT> \
           --header 'Content-Type: application/json' \
           --data '{ 
        	"Case": "001", 
        	"Message": "Case 001: opened..." 
           }'
      ```
      OR
      ```powershell
      curl -Method POST -Uri <API_GW_ENDPOINT> `
           -ContentType 'application/json' `
           -Body '{ 
        	"Case": "001", 
        	"Message": "Case 001: opened..." 
           }' `
           -UseBasicParsing
      ```