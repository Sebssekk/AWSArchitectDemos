export const handler = async (event) => {
  // Create a support case using the input as the case ID, then return a confirmation message
  const myCaseID = event.inputCaseID;
  const myMessage = "Case " + myCaseID + ": opened...";
  return { Case: myCaseID, Message: myMessage };
};
