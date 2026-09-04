
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { captureAWSv3Client } = require('aws-xray-sdk')
const s3 = captureAWSv3Client(new S3Client({}))
const { translateText } = require('./translate')

// Translate and save output to S3
const doTranslation = async (message) => {
  console.log(`doTranslation: ${JSON.stringify(message)}`)
  // Return the async chain directly so Lambda can retry failed records.
  const sourceKey = decodeURIComponent(message.object.key.replace(/\+/g, ' '))
  const getObjRes = await s3.send(new GetObjectCommand({
    Bucket: message.bucket.name,
    Key: sourceKey,
  }))
  const originalText = await getObjRes.Body.transformToString()
  const data = await translateText(
    originalText,
    process.env.TargetLanguageCode,
    process.env.SourceLanguageCode,
  )
  const baseObjectName = sourceKey.split('/').pop().replace(/\.txt$/i, '')

  await s3.send(new PutObjectCommand({
    Bucket: process.env.OutputBucket,
    Key: `translated/${baseObjectName}-${process.env.TargetLanguageCode}.txt`,
    Body: data.TranslatedText,
    ContentType: 'text/plain',
  }))
}




// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  if (!event?.Records?.length) return

  // Do not swallow errors: S3/Lambda must retry failed translations.
  await Promise.all(event.Records.map((record) => doTranslation(record.s3)))
}

