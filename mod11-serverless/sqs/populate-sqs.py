import boto3
import random

aws_region = boto3.session.Session().region_name
orders = ["An apple pie for me please", "Give me a chocolate pie", "I'd like a banana pie", "An ice cream would be perfect"]

client = boto3.client('sqs', region_name=aws_region)
queue_name="pieOrder"
queue_url = client.get_queue_url(
                    QueueName=queue_name,
                )
for i in range(15):
    response = client.send_message(
        QueueUrl=queue_url['QueueUrl'],
        MessageBody=orders[ random.randint(0, 3) ],
    )    
    print(response)
