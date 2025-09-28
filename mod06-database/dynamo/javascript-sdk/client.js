import {parse} from 'csv-parse'
import { createReadStream } from 'fs'
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { loadSharedConfigFiles} from '@aws-sdk/shared-ini-file-loader' 

const REGION = (await loadSharedConfigFiles()).region

const readCsv = async () => {
    const csvArr = []
    const parser = parse({from_line: 2})
    try{
      createReadStream('../dynamoStarter/Employee-2022-12-16.csv').pipe(parser)
      for await (const row of parser) {
          row[4] = row[4].slice(1,-1).split('"').filter(e => (e && e !== ',') )
          row[4] = row[4].map(s => ({"S":s}))
          csvArr.push(row)
      } 
      return csvArr
    } catch(err) {
      console.log(err)
      throw Error()
    }

}


const csvArr = await readCsv()
console.log(csvArr)
const putItemsPayload =  csvArr.map(row => ({
    PutRequest: {
      Item: {
        LoginAlias: { S: row[0] },
        ManagerLoginAlias: { S: row[1] },
        FirstName: { S: row[2] },
        LastName: { S: row[3] },
        Skills: { L: row[4] },
      },
    },
  }))

  //console.log(putItemsPayload)

const ddbClient = new DynamoDBClient({ region: REGION });

const batchPutparams = {
    RequestItems: {
      'Employee': putItemsPayload
    },
  };
  
  export const clientBatchPut = async () => {
    try {
      const data = await ddbClient.send(new BatchWriteItemCommand(batchPutparams));
      console.log("Success, items inserted", data);
      return data;
    } catch (err) {
      console.log("Error", err);
    }
  };
