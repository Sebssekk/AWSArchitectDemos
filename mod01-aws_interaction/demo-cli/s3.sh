if [ "$(pwd | awk '{n=split($1,path,"/");print path[n]}')" != 'demo-cli' ]
then
    echo "[X] Please ensure you are in mod03/demo-cli folder.."
    echo "[X] Your current path is $(pwd)"
    exit
fi

export $(cat ../../.env)

export AWS_REGION=$(aws configure get region)

# low level api
aws s3api create-bucket \
    --bucket ${NICKNAME}-demo-public-$(date --rfc-3339 date) \
    --object-ownership BucketOwnerPreferred \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=${AWS_REGION}
    #--acl public-read \ MUST DISABLE PUBLIC BLOCK

aws s3api delete-public-access-block \
    --bucket ${NICKNAME}-demo-public-$(date --rfc-3339 date) \
    --region $AWS_REGION

aws s3api put-bucket-acl \
    --bucket ${NICKNAME}-demo-public-$(date --rfc-3339 date) \
    --acl public-read

echo "[+] Bucket successfullt created > s3://${NICKNAME}-demo-public-$(date --rfc-3339 date)"

# high level api 
#aws s3 mb s3://${NICKNAME}-demo-public-h-$(date --rfc-3339 date) \
#   --region $AWS_REGION 
# But there's no "acl" setting on thi command (high level api, easier to user but less configurable)
# You have to confire it later  
