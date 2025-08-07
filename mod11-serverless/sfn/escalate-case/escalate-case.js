export const handler = async (event) => {
  // Escalate the support case
  const myCaseID = event.Case;
  const myCaseStatus = event.Status;
  const myMessage = event.Message + "escalating.";
  return { Case: myCaseID, Status: myCaseStatus, Message: myMessage };
};
