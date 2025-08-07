export AWS_SECRET_ACCESS_KEY=$(aws cloudformation describe-stacks --stack-name AWSArchitect-PermissionStack --query Stacks[0].Outputs[0].OutputValue | cut -d \" -f 2)
export AWS_ACCESS_KEY_ID=$(aws cloudformation describe-stacks --stack-name AWSArchitect-PermissionStack --query Stacks[0].Outputs[1].OutputValue | cut -d \" -f 2)


# Test identity
aws sts get-caller-identity

# Error test (no permission)
aws s3 ls

# Successful call (permitted)
aws s3 ls s3://<demo-public-bucket>

aws s3api get-object --bucket <demo-public-bucket> --key translated.txt

# Forbidden Call (by bucket acl)
aws s3 cp s3://<demo-private-bucket>/downloadMe.txt

