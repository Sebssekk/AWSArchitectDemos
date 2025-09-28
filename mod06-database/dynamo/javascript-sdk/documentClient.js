import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import { loadSharedConfigFiles} from '@aws-sdk/shared-ini-file-loader' 

const REGION = (await loadSharedConfigFiles()).region

const ddbClient = new DynamoDBClient({ region: REGION });

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: false, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);


// Put on Employee table

const putParams = {
  TableName: "Employee",
  /*
    Convert the key JavaScript object you are adding to the
    required Amazon DynamoDB record. The format of values specifies
    the datatype. The following list demonstrates different
    datatype formatting requirements:
    String: "String",
    NumAttribute: 1,
    BoolAttribute: true,
    ListAttribute: [1, "two", false],
    MapAttribute: { foo: "bar" },
    NullAttribute: null
     */
  Item: {
    LoginAlias: 'diegor', // Partition Key
    ManagerLoginAlias: 'johns,',      // Sort Key
    FirstName: 'Diego',
    LastName: 'Ramirez',
    Skills: ["executive", "assistant"], // For example,  'Episode': 2 (only required if table has sort key)
  },
};

export const documentClientputItem = async () => {
  try {
    const data = await ddbDocClient.send(new PutCommand(putParams));
    console.log("Success - item added or updated", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};


// Query Employee Table


const queryParams = {
  TableName: "Employee",
  /*
  Convert the JavaScript object defining the objects to the required
  Amazon DynamoDB record. The format of values specifies the datatype. The
  following list demonstrates different datatype formatting requirements:
  String: "String",
  NumAttribute: 1,
  BoolAttribute: true,
  ListAttribute: [1, "two", false],
  MapAttribute: { foo: "bar" },
  NullAttribute: null
   */
  ExpressionAttributeValues: {
    ":la": "diegor",
    //":mla": "jhons",
    ":skill": "executive",
  },
  // Specifies the values that define the range of the retrieved items. In this case, items in Season 2 before episode 9.
  KeyConditionExpression: "LoginAlias = :la", //and ManagerLoginAlias = :mla",
  // Filter that returns only episodes that meet previous criteria and have the subtitle 'The Return'
  FilterExpression: "contains (Skills, :skill)",
};

export const documentClientQueryItem = async () => {
  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    console.log("Success. Item details: ", data);
    // console.log("Success. Item details: ", data.Items);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};


