# If your identity is not 'demo-user' when you run the script
# You can export these variables
#
# export AWS_SECRET_ACCESS_KEY=$(aws cloudformation describe-stacks --stack-name AWSArchitect-PermissionStack --query Stacks[0].Outputs[0].OutputValue | cut -d \" -f 2)
# export AWS_ACCESS_KEY_ID=$(aws cloudformation describe-stacks --stack-name AWSArchitect-PermissionStack --query Stacks[0].Outputs[1].OutputValue | cut -d \" -f 2)


echo "[+] Printing starting identity (demo-user)"
aws sts get-caller-identity
echo "[+] Printing demoAdminRole info"
aws iam list-roles --query "Roles[?RoleName == 'demoAdminRole' ].[RoleName, Arn]"

echo "[+] sts assume-role output : "
aws sts assume-role \
    --role-arn $(aws iam list-roles --query "Roles[?RoleName == 'demoAdminRole' ].Arn | [0]" | cut -d '"' -f 2)  \
    --role-session-name AWSCLI-Session

role=$(aws sts assume-role \
    --role-arn $(aws iam list-roles --query "Roles[?RoleName == 'demoAdminRole' ].Arn | [0]" | cut -d '"' -f 2)  \
    --role-session-name AWSCLI-Session --output json
)

export AWS_SECRET_ACCESS_KEY=$(echo $role | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $role | jq -r '.Credentials.SessionToken')
export AWS_ACCESS_KEY_ID=$(echo $role | jq -r '.Credentials.AccessKeyId')

echo "[+] Calling 'aws sts get-caller-identity' after populating variables"
echo "[+] AWS_SECRET_ACCESS_KEY"
echo "[+] AWS__ACCESS_KEY_ID"
echo "[+] AWS_SESSION_TOKEN"
aws sts get-caller-identity

echo "[+] Now that you're Admin you can retrieve list of all buckets"
aws s3 ls