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

# Example Polly command (replace with your actual usage)
# Synthesize speech from text
$pollyText = "Hello, my name is Joanna. I learned about the awesome AWS world on 10/3 of last year."
$voiceId = "Joanna"
$outputFile = "HELLO.mp3"

aws polly synthesize-speech `
    --output-format mp3 `
    --voice-id $voiceId `
    --text "$pollyText" `
    $outputFile

Write-Host "[+] Polly synthesis complete: $outputFile"

# Find the S3 bucket with 'demo-public' in its name
$bucketName = aws s3 ls | Select-String 'demo-public' | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Select-Object -First 1

if (-not $bucketName) {
    Write-Host "[X] Bucket is not in place.. Can't upload file"
    Write-Host "[X] Did you run ./s3.ps1 ?"
    exit
}

# Upload the file to S3
aws s3 cp ./$outputFile "s3://$bucketName/$outputFile"
aws s3api put-object-acl --bucket $bucketName --key $outputFile --acl public-read

Write-Host "[+] File uploaded"
Write-Host "[+] Try to download it @"
Write-Host "[+] https://$bucketName.s3.$env:AWS_REGION.amazonaws.com/$outputFile"
