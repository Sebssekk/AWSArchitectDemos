export const handler = async (event) => {
  // Close the support case
  const myCaseStatus = event.Status;
  const myCaseID = event.Case;
  const myMessage = event.Message + "closed.";
  return { Case: myCaseID, Status: myCaseStatus, Message: myMessage };
};
