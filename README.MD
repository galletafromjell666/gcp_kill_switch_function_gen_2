# gcp_kill_switch_function_gen_2

A simple cloud run function gen 2 triggered by a PubSub Message that will disable billing for a project.

## Set up

- Git, node and npm installed. (Already available on cloud shell terminal)
- Cloud Billing API enabled. [API](https://console.cloud.google.com/marketplace/product/google/cloudbilling.googleapis.com)
- A Budget alert connected to a Pub/Sub topic. [DOCS](https://cloud.google.com/billing/docs/how-to/budgets-programmatic-notifications#connect-budget)
- default service account for Compute Engine with role Billing Account Administrator.
  - Or create your own service account for the function.

## Deploy

Clone the repository

```bash
git clone https://github.com/galletafromjell666/gcp_kill_switch_function_gen_2.git
```

Move inside the repository

```bash
cd gcp_kill_switch_function_gen_2
```

Install modules

```bash
npm install
```

Update the line 4 from `index.ts` with your own PROJECT_ID.

```bash
const PROJECT_ID = "<YOUR_PROJECT_ID>";
```

Build

```bash
npm run build
```

Deploy

```bash
gcloud functions deploy gcp_kill_switch_function_gen_2 \
--gen2 \
--runtime=nodejs22 \
--region=<YOUR_REGION> \
--source=. \
--memory 512 \
--cpu 1 \
--max-instances 2 \
--entry-point=killInit \
--trigger-topic=<YOUR_PUBSUB_TOPIC>
```

## Test

We will send a test message to trigger the disabling of billing in the project.

```bash
gcloud pubsub topics publish <YOUR_PUBSUB_TOPIC> \
 --message='{"costAmount":2,"budgetAmount":1}'
```
