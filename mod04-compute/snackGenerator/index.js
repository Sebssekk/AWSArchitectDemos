const fs = require("fs");
const directoryPath = "/opt";

exports.handler = async function (event, context) {
  // Just a test to see layers
  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    console.log("[+] pwd = /opt --> files:");
    //listing all files using forEach
    files.forEach((file) => {
      // Do whatever you want to do with the file
      console.log(`|- [+] ${file}`);
    });
  });
  //###################

  if (event.httpMethod !== "GET") {
    throw new Error(
      `postMethod only accepts GET method, you tried: ${event.httpMethod} method.`
    );
  }
  console.log("request:", JSON.stringify(event, undefined, 2));
  const snack_list = ["Chips", "Mars", "Bounty", "Banana"];
  const snack = snack_list[Math.floor(Math.random() * 4)];

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<h1>Hello, Caller!</h1> <h3>Nice to see you here</h3>\n<p>I'm running somewhere in the cloud to give you this snack: ${snack}</p>`,
  };
};
