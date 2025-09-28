import { documentClientputItem } from "./documentClient.js"
import { clientBatchPut } from "./client.js"



console.log("[+] Using Low level client to BatchPut items on Employee Table")
const client_data = await clientBatchPut()
console.log("[+] Using Document client to Put Item on Employee Table")
const doc_data = await documentClientputItem()


