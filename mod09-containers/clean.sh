bucketName=$(aws s3 ls | grep demopipeline | cut -d " " -f 3)

for bucket in $bucketName
do
    # empty bucket
    aws s3 rm s3://${bucket} --recursive
    # delete bucketa
    aws s3 rb s3://${bucket} --force  
done