#!/bin/bash
AWS_REGION=$(aws configure get region)
bucket=$(aws s3 ls | grep demo-private | cut -d " " -f 3)
echo "[+] Object url :"
echo "https://${bucket}.s3.${AWS_REGION}.amazonaws.com/downloadMe.txt"
echo "[+] Presigned url :"
aws s3 presign s3://${bucket}/downloadMe.txt \
    --expires-in 3600 \
    --region $AWS_REGION \
    --endpoint-url https://s3.${AWS_REGION}.amazonaws.com 

