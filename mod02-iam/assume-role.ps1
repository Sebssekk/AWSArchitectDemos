# If your identity is not 'demo-user' when you run the script
# You can export these variables as in the original script if needed

Write-Host "[+] Printing starting identity (demo-user)"
aws sts get-caller-identity

Write-Host "[+] Printing demoAdminRole info"
aws iam list-roles --query "Roles[?RoleName == 'demoAdminRole' ].[RoleName, Arn]"

Write-Host "[+] sts assume-role output :"
$roleArn = aws iam list-roles --query "Roles[?RoleName == 'demoAdminRole' ].Arn | [0]" | ForEach-Object { $_.Trim('"') }

$assumeRoleOutput = aws sts assume-role `
    --role-arn $roleArn `
    --role-session-name AWSCLI-Session --output json

$role = $assumeRoleOutput | ConvertFrom-Json

$env:AWS_SECRET_ACCESS_KEY = $role.Credentials.SecretAccessKey
$env:AWS_SESSION_TOKEN     = $role.Credentials.SessionToken
$env:AWS_ACCESS_KEY_ID     = $role.Credentials.AccessKeyId

Write-Host "[+] Calling 'aws sts get-caller-identity' after populating variables"
Write-Host "[+] AWS_SECRET_ACCESS_KEY"
Write-Host "[+] AWS_ACCESS_KEY_ID"
Write-Host "[+] AWS_SESSION_TOKEN"
aws sts get-caller-identity

Write-Host "[+] Now that you're Admin you can retrieve list of all buckets"
aws s3 ls