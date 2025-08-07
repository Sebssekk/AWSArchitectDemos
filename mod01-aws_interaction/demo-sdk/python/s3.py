import boto3

aws_region = boto3.session.Session().region_name

text = "Hi! I'm your trainer today, nice to meet you. Let's learn some AWS!"
print('[+] InputText: ' + text)

translate = boto3.client(service_name='translate', region_name=aws_region, use_ssl=True)

result = translate.translate_text(Text=text, 
            SourceLanguageCode="en", TargetLanguageCode="de")
print('--- SourceLanguageCode: ' + result.get('SourceLanguageCode'))
print('--- TargetLanguageCode: ' + result.get('TargetLanguageCode'))
print('[+] TranslatedText: ' + result.get('TranslatedText'))


print("[+] Ready to upload to s3")

bucket = ""

#Find Bucket Name
s3_client = boto3.client("s3")
bucket_list = s3_client.list_buckets()
for b in bucket_list['Buckets']:
    if "demo-public" in b["Name"]:
        bucket= b["Name"]
        print('--- Target backet: ' + bucket)

if not bucket:
    raise SystemExit("[X] Bucket not found... Did you run ../demo-cli/s3.sh ?")

body = result.get('TranslatedText').encode('utf8')
s3 = boto3.resource('s3')
obj = s3.Object(bucket, 'translated.txt')
obj.put(Body=body)

print(f'[+] Object uploaded at s3://{obj.bucket_name}/{obj.key}')