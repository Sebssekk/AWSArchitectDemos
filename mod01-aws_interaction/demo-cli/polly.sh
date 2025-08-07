AWS_REGION=$(aws configure get region)
aws polly synthesize-speech \
    --output-format mp3 \
    --voice-id Joanna \
    --text 'Hello, my name is Joanna. I learned about the awesome AWS world on 10/3 of last year.' \
    HELLO.mp3

bucketName=$(aws s3 ls | grep demo-public | cut -d " " -f 3)

if ! [[ $bucketName ]];
then 
    echo "[X] Bucket is not in place.. Can't upload file"
    echo "[X] Did yoy run ./s3.sh  ?"
    exit
fi

aws s3 cp ./HELLO.mp3 s3://${bucketName}/HELLO.mp3
aws s3api put-object-acl --bucket ${bucketName} --key HELLO.mp3 --acl public-read

echo "[+] File uploaded"
echo "[+] Try to download it @"

echo "[+] https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/HELLO.mp3"