'use strict'

const { TranslateClient, TranslateTextCommand } = require("@aws-sdk/client-translate")

const translate = new TranslateClient({region: process.env.AWS_REGION })
// The maximum number of characters you can submit in a single Translate request.
// This truncates the input, so only the first MAX_LENGTH characters will be translated.
const MAX_LENGTH = 5000   

const translateText = async (originalText, targetLanguageCode, sourceLanguageCode) => {
    const params = {
        Text: originalText.substring(0, MAX_LENGTH),
        SourceLanguageCode: sourceLanguageCode,
        TargetLanguageCode: targetLanguageCode
    }

    try {
      const command = new TranslateTextCommand(params)
      const response = await translate.send(command)
      return response
    } catch (err) {
        console.error(err)
        throw new Error(`Translation failed: ${err.message}`)
    }
}

module.exports = { translateText }