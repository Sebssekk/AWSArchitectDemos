import { S3Client, ListBucketsCommand, GetObjectCommand, NotFound } from "@aws-sdk/client-s3";
import { loadSharedConfigFiles} from '@aws-sdk/shared-ini-file-loader' 

const REGION = (await loadSharedConfigFiles()).region
const s3Client = new S3Client({ region: REGION });

const list = async () => {
    try {
      const bucket_list = await s3Client.send(new ListBucketsCommand({}));
      console.log("[+] List bucket Success : ", bucket_list.Buckets);

      const bucket = bucket_list.Buckets.filter(b => b.Name.includes("demo-public"))[0]
      if (bucket){
        console.log(`[+] Target Bucket: ${bucket.Name}`)
      }
      else{
        throw new NotFound();
      }
      const file = "translated.txt"
      
      const bucketParams = {
        Bucket: bucket.Name,
        Key: file,
      };
      
      console.log(`[+] Trying to download file "${file}"`)
      
      const obj = await s3Client.send(new GetObjectCommand(bucketParams));
      
      const strFromObj = await obj.Body.transformToString();

      console.log(`[+] Dowloaded object content : "${strFromObj}"`)

    } catch (err) {
      if (err instanceof NotFound){
        console.log("[X] Target Bucket not found... Did you run ../demo-cli/s3.sh ?")
      }
      else{
        console.log("[X] Error", err);
      }
    }
};

await list()
 