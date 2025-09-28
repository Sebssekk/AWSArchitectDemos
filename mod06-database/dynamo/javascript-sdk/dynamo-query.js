import {  documentClientQueryItem  } from "./documentClient.js"

const data = await documentClientQueryItem()
console.log(data.Items)