# Check if current directory is 'demo-cli'
if ((Split-Path -Leaf (Get-Location)) -ne 'demo-cli') {
    Write-Host "[X] Please ensure you are in mod03/demo-cli folder.."
    Write-Host "[X] Your current path is $(Get-Location)"
    exit
}

# Load environment variables from ../../.env
Get-Content ../../.env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Get AWS region from AWS CLI config
$env:AWS_REGION = aws configure get region

# Prepare bucket name with current date
$bucketDate = Get-Date -Format 'yyyy-MM-dd'
$bucketName = "${env:NICKNAME}-demo-public-$bucketDate"

# Low level API: create bucket
aws s3api create-bucket `
    --bucket $bucketName `
    --object-ownership BucketOwnerPreferred `
    --region $env:AWS_REGION `
    --create-bucket-configuration LocationConstraint=$env:AWS_REGION
    # --acl public-read # MUST DISABLE PUBLIC BLOCK

aws s3api delete-public-access-block `
    --bucket $bucketName `
    --region $env:AWS_REGION

aws s3api put-bucket-acl `
    --bucket $bucketName `
    --acl public-read

Write-Host "[+] Bucket successfully created > s3://$bucketName"

# High level API example (commented out)
# aws s3 mb s3://$($env:NICKNAME)-demo-public-h-$bucketDate `
#    --region $env:AWS_REGION
# But there's no "acl" setting on this command (high level api, easier to use but less configurable)
# You have to configure it later
