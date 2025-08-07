import json
import boto3
import os
from unsatisfiableOrder import UnsatisfiableOrderException

def lambda_handler(event, context):
    if event:
        bad_orders = False
        print("Start processing messages")
        print(f"Batch size: { len(event['Records'])}")
        region_name = os.environ['AWS_REGION']

        sqs = boto3.client('sqs', region_name=region_name)
        queue_name = event['Records'][0]['eventSourceARN'].split(':')[-1]
        queue_url = sqs.get_queue_url(
                    QueueName=queue_name,
                )
        
        for i,record in enumerate(event['Records']):
            body = record['body']
            print(f"[+] Order #{i+1}: {body}")
            if "apple pie" in record["body"]:
                print("[+] Order received: APPLE PIE --> Making the pie.....")
                print("[-] Signal the queue")
                response = sqs.delete_message(
                        QueueUrl=queue_url['QueueUrl'],
                        ReceiptHandle=record['receiptHandle']
                    )
                print(response)
            elif "chocolate pie" in record["body"]:
                print("[+] Order received: CHOCOLATE PIE --> Making the pie.....")
                print("[-] Signal the queue")
                response = sqs.delete_message(
                        QueueUrl=queue_url['QueueUrl'],
                        ReceiptHandle=record['receiptHandle']
                    )
                print(response)
            elif "banana pie" in record["body"]:
                print("[+] Order received: BANANA PIE --> Making the pie.....")
                print("[-] Signal the queue")
                response = sqs.delete_message(
                        QueueUrl=queue_url['QueueUrl'],
                        ReceiptHandle=record['receiptHandle']
                    )
                print(response)
            else:
                print("[X] Sorry... I can't satisfy this order")
                bad_orders = True
        
        # Now Every messages of the batch have been processed
        # Good ones have been already deleted
        # If some are bad 'bad_orders' is set to True

        if bad_orders:
            raise UnsatisfiableOrderException()


            
    return {
        'statusCode': 200,
        'body': json.dumps('Order processed successfully!')
    }