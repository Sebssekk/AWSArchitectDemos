import json
def lambda_handler(event, context):
    records = event.get('Records', []) if event else []
    failures = []
    supported_orders = ('apple pie', 'chocolate pie', 'banana pie')

    print(f"Start processing messages; batch size: {len(records)}")
    for index, record in enumerate(records, start=1):
        body = record.get('body', '').lower()
        print(f"[+] Order #{index}: {body}")
        if any(order in body for order in supported_orders):
            print("[+] Order received --> Making the pie.....")
        else:
            print("[X] Sorry... I can't satisfy this order")
            failures.append({'itemIdentifier': record['messageId']})

    # The event source mapping deletes successes and retries only these IDs.
    return {
        'batchItemFailures': failures,
    }