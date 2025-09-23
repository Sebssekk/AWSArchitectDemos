# Get the key id
$winKeyId = aws ec2 describe-key-pairs --filters Name=key-name,Values=demo-win-key --query "KeyPairs[*].KeyPairId" --output text
$linKeyId = aws ec2 describe-key-pairs --filters Name=key-name,Values=demo-lin-key --query "KeyPairs[*].KeyPairId" --output text

# Save the key to a .pem file
aws ssm get-parameter --name "/ec2/keypair/$winKeyId" --with-decryption --query "Parameter.Value" --output text | Out-File -Encoding ascii demo-win-key.pem
aws ssm get-parameter --name "/ec2/keypair/$linKeyId" --with-decryption --query "Parameter.Value" --output text | Out-File -Encoding ascii demo-lin-key.pem
