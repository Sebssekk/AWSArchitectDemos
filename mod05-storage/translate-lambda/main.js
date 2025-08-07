
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const s3 = new S3Client({ region: process.env.AWS_REGION })

const { translateText } = require('./translate')

// Translate and save output to S3
const doTranslation = async (message) => {
  console.log(`doTranslation: ${JSON.stringify(message)}`)
  return new Promise(async (resolve, reject) => {
      
    // Get original text from object in incoming event
    const getObjRes = await s3.send(new GetObjectCommand({
      Bucket: message.bucket.name,
      Key: message.object.key,
    }))
    // Read stream to string
    const  originalText=   await getObjRes.Body.transformToString()
    // Translate the text
    const data = await translateText(originalText, process.env.TargetLanguageCode, process.env.SourceLanguageCode)

    // Save the new translation
    const baseObjectName = message.object.key.replace('.txt','').split('/').pop()
    await s3.send(new PutObjectCommand({
      Bucket: process.env.OutputBucket,
      Key: `translated/${baseObjectName}-${process.env.TargetLanguageCode}.txt`,
      Body: data.TranslatedText,
      ContentType: 'text/plain'
    }))
    resolve()
  })
}




// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message = record.s3
        await doTranslation(message)
      } catch (err) {
        console.error(`Handler error: ${err}`)
      }
    })
  )
}

