# Find all S3 buckets with 'demo-public' in their name
$buckets = aws s3 ls | Select-String 'demopipeline' | ForEach-Object {
    ($_ -split '\s+')[-1]
}

foreach ($bucket in $buckets) {
    # Empty the bucket
    aws s3 rm "s3://$bucket" --recursive
    # Delete the bucket
    aws s3 rb "s3://$bucket" --force
}
