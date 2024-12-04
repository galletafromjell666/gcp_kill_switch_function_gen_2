const functions = require("@google-cloud/functions-framework");
const { CloudBillingClient } = require("@google-cloud/billing").v1;

const PROJECT_ID = "<YOUR_PROJECT_ID>";
const PROJECT_NAME = `projects/${PROJECT_ID}`;

const billingClient = new CloudBillingClient({
  projectId: PROJECT_ID,
});

functions.cloudEvent("killInit", async (cloudEvent: any) => {
  console.log("\t\t Function Triggered");
  const message = cloudEvent.data.message.data;
  const decodedJsonString = Buffer.from(message, "base64").toString("utf8");
  const pubSubData = JSON.parse(decodedJsonString);
  console.log("Data from PubSub: ", pubSubData);
  const { costAmount, budgetAmount } = pubSubData;

  if (!PROJECT_ID || !PROJECT_NAME) {
    console.log(
      "-- Empty Project ID or Project Name, please check and re run --"
    );
  }

  if (costAmount <= budgetAmount) {
    console.log("No action necessary.");
    return `No action necessary. (Current cost: ${costAmount})`;
  }

  const isBillingEnabled = await getIsBillingEnabled(PROJECT_NAME);

  if (isBillingEnabled) {
    console.log("Disabling billing...");
    await disableBilling(PROJECT_NAME);
    return;
  } else {
    console.log("Billing is already disabled");
    return;
  }
});

async function getIsBillingEnabled(projectName: string) {
  const getProjectBillingInfoRequest = {
    name: projectName,
  };
  try {
    const [response] = await billingClient.getProjectBillingInfo(
      getProjectBillingInfoRequest
    );
    console.log("Response from getProjectBillingInfo", response);
    const isBillingEnabled = response.billingEnabled;
    console.log(`\t-- Billing is ${isBillingEnabled}`);
    return isBillingEnabled;
  } catch (e) {
    console.log(
      "An error occurred while using the method getProjectBillingInfo: ",
      e
    );
    return true;
  }
}

async function disableBilling(projectName: string) {
  const projectBillingInfoRequest = {
    name: projectName,
    resource: {
      billingAccountName: "",
      billingEnabled: false,
    },
  };

  try {
    const [response] = await billingClient.updateProjectBillingInfo(
      projectBillingInfoRequest
    );

    console.log("Response from updateProjectBillingInfo", response);
    console.log("\t-- Billing disabled --");
  } catch (e) {
    console.log(
      "An error occurred using the method updateProjectBillingInfo: ",
      e
    );
  }
}
