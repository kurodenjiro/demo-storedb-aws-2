# StoreDB AWS — a sponsored vibecoding starter

Turn one prompt into a deployable product API on AWS. This repository combines a real AWS implementation with a real Sponsored Compute campaign, so a vibecoder can clone, claim a grant, and ask Claude Code or Codex to keep building without starting from an empty project.

## The demo

StoreDB is a small product-catalog backend built with:

- **Amazon API Gateway HTTP API** for public routes.
- **AWS Lambda (Node.js 20)** for request handling.
- **Amazon DynamoDB** for durable, serverless storage.
- **AWS SAM** for repeatable infrastructure deployment.
- **Sponsored Compute MCP** for discovering and claiming the repo grant.

The deployed API supports:

```text
GET    /products
GET    /products/{id}
POST   /products
DELETE /products/{id}
GET    /health
```

## Try it with Claude Code or Codex

```bash
git clone https://github.com/kurodenjiro/demo-storedb-aws-2
cd demo-storedb-aws-2
npm install
```

Open Claude Code or Codex in this directory and use this prompt:

> Check whether this repo has sponsorship. Ask me before claiming it. Then inspect the AWS SAM stack, run the tests, and help me deploy StoreDB to AWS. Add a checkout-ready inventory field without removing the existing routes.

The agent will:

1. Read `sponsored.json`.
2. Verify the campaign on Avalanche Fuji—never trust the file by itself.
3. Ask before claiming the grant.
4. Understand the existing Lambda, DynamoDB and API Gateway architecture.
5. Make and test a real product change instead of generating a throwaway mockup.

## Live campaign

| Field | Value |
|---|---|
| Network | Avalanche Fuji (`43113`) |
| Campaign | `0x6f438efc0e0ecd571eaf3dbacd6628545efd2848d852060460800231d0ab622d` |
| Grant per developer | `2.00 XSGD` |
| Repository | `kurodenjiro/demo-storedb-aws-2` |
| Verification | On-chain `GrantManager`, via Sponsored Compute MCP |

`sponsored.json` is only a pointer. It contains no wallet, private key, AWS credential, API key or contract authority. Spending limits and approved recipients remain enforced on-chain.

## Run locally

No AWS account is required for the unit tests:

```bash
npm test
```

To exercise the Lambda through SAM locally:

```bash
sam build
sam local start-api
curl http://127.0.0.1:3000/health
```

Create a product:

```bash
curl -X POST http://127.0.0.1:3000/products \
  -H 'content-type: application/json' \
  -d '{"name":"Mechanical keyboard","price":12900,"inventory":12}'
```

## Deploy to AWS

You need an AWS account, configured AWS CLI credentials, and AWS SAM CLI:

```bash
sam build
sam deploy --guided
```

The stack output prints `ApiUrl`. AWS billing is separate from the XSGD campaign: the grant demonstrates purpose-bound agent spending and onboarding; it does not impersonate AWS credits or hide cloud costs.

## Why this matters for vibecoding

A starter repo normally gives a builder code. A sponsored repo gives them code **plus a verified path to the services needed to finish it**. Organizations reach developers at the moment of implementation, while developers get faster activation without placing unrestricted credentials or budgets inside the agent context.

The important boundary is explicit: the repo can advertise a campaign, but only the on-chain grant can authorize spending.
