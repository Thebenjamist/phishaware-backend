# PhishAware Backend

Serverless REST API backend for **PhishAware** — a phishing awareness training application built as a Masters dissertation project. The platform simulates phishing email scenarios and tracks user quiz scores to improve phishing detection literacy.

## Overview

PhishAware Backend is deployed on AWS using the Serverless Framework. It exposes an HTTP API via API Gateway V2, backed by Lambda functions, DynamoDB for persistence, and Cognito for user authentication.

Users are presented with a dataset of 20 emails (12 phishing, 8 legitimate) spanning three categories of phishing attack, and their identification scores are tracked over time.

## Architecture

```
Client
  │
  ▼
API Gateway (HTTP API v2)
  │
  ├── Lambda Authorizer (JWT via Cognito)
  │
  ├── /emails          → EmailsFunction     → DynamoDB (email-table)
  ├── /scores          → ScoresFunction     → DynamoDB (score-table)
  ├── /profile         → UserFunction       → DynamoDB (user-table)
  └── /auth/*          → AuthorizerFunction → Cognito
```

**AWS services used:**
- **Lambda** — serverless compute for all function handlers
- **API Gateway V2 (HTTP API)** — routing and CORS
- **DynamoDB** — on-demand tables for users, emails, and scores
- **Cognito User Pool** — user sign-up, sign-in, email verification, and JWT issuance

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 16.x |
| Framework | Serverless Framework v3 |
| Cloud | AWS (eu-west-2) |
| Database | Amazon DynamoDB |
| Auth | Amazon Cognito + Lambda Authorizer |
| Local Dev | serverless-offline + serverless-dynamodb (local) |

## Project Structure

```
phishaware/
├── common/
│   ├── authorizer.js      # JWT Lambda authorizer + Cognito triggers
│   ├── dynamodb.js        # DynamoDB DocumentClient wrapper (get/write/scan/update/delete)
│   └── responses.js       # Standardised HTTP response helper
├── functions/
│   ├── emails.js          # Email dataset CRUD
│   ├── scores.js          # User score submission and retrieval
│   └── user.js            # User profile management
├── resources/
│   ├── cognito.yml        # Cognito User Pool / Client / Domain CloudFormation
│   ├── dynamodb.yml       # DynamoDB table definitions
│   └── functions.yml      # Lambda function + API event definitions
├── handler.js             # Example/health-check handler
├── serverless.yml         # Main Serverless Framework config
└── package.json
```

## API Reference

All protected endpoints require a valid Cognito access token in the `Authorization` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/refresh` | Header: `Refresh` token | Refresh a Cognito access token |

> User registration and sign-in are handled directly through Cognito (not via custom endpoints).

### Emails

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/emails` | None | Fetch all emails in the dataset |
| `GET` | `/add-initial-emails` | None | Seed the database with the default 20 emails |

### Scores

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/scores` | Required | Fetch all scores for the authenticated user |
| `POST` | `/submit-score` | Required | Submit a new quiz score |

**POST `/submit-score` body:**
```json
{
  "score": {
    "correct": 14,
    "total": 20,
    "timeTaken": 120
  }
}
```

### User Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` | Required | Fetch the authenticated user's profile |
| `GET` | `/update-first-time-open` | Required | Mark the user's first-time onboarding as complete |

### Response Format

All endpoints return a consistent JSON envelope:

```json
{
  "message": "Human-readable status message",
  "data": {}
}
```

## Data Models

### User (`user-table`)

| Field | Type | Description |
|---|---|---|
| `id` | String (PK) | Cognito `sub` (user UUID) |
| `email` | String | User email address |
| `firstTimeOpen` | Boolean | Whether the user has completed onboarding |

### Email (`email-table`)

| Field | Type | Description |
|---|---|---|
| `id` | String (PK) | Email ID (1–20) |
| `senderEmail` | String | Sender email address |
| `senderName` | String | Display name of sender |
| `subject` | String | Email subject line |
| `messageGreeting` | String | Salutation |
| `messageBody` | String | Main body text |
| `messageClosing` | String | Sign-off |
| `isPhishing` | Boolean | Whether the email is a phishing attempt |
| `phishingType` | String \| null | `"A"` / `"B"` / `"C"` or `null` for legitimate emails |

**Phishing categories:**
- **Type A** — Bulk / Spear Phishing / Business Email Compromise (BEC)
- **Type B** — Credential Harvesting
- **Type C** — Malware Delivery

The dataset contains 12 phishing emails (4 per category) and 8 legitimate emails.

### Score (`score-table`)

| Field | Type | Description |
|---|---|---|
| `id` | String (PK) | Auto-generated UUID |
| `userId` | String | Cognito `sub` of the submitting user |
| *(score fields)* | Any | Forwarded directly from the request body `score` object |

## Authentication Flow

1. User registers via Cognito (email + password).
2. Cognito sends a verification link; user confirms their email.
3. On confirmation, a `PostConfirmation` trigger calls `confirmSignUp`, which writes a user record to DynamoDB.
4. User signs in and receives a Cognito access token (JWT).
5. The client passes the token in the `Authorization` header.
6. The Lambda Authorizer (`customAuthorizer`) verifies the JWT using `aws-jwt-verify` and returns an IAM policy allowing or denying the request.
7. The `userId` (Cognito `sub`) is forwarded to downstream handlers via the authorizer context.

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Serverless Framework](https://www.serverless.com/) v3: `npm install -g serverless`
- AWS CLI configured with a named profile (`personal`) that has permissions for Lambda, API Gateway, DynamoDB, Cognito, CloudFormation, S3, and IAM
- Java runtime (JRE/JDK) — required by the local DynamoDB emulator

## Local Development

Install dependencies:

```bash
cd phishaware
npm install
```

Start the local stack (DynamoDB local + serverless-offline):

```bash
npx serverless offline start
```

The API will be available at `http://localhost:3000`. DynamoDB local runs on port `8001`.

Seed the local email table:

```bash
curl http://localhost:3000/add-initial-emails
```

> The local DynamoDB data is persisted to `phishaware/dynamodb/`. Delete the folder to reset the local database.

## Deployment

Deploy to the `dev` stage on AWS:

```bash
cd phishaware
npx serverless deploy
```

After deployment, Serverless prints the API Gateway endpoint URL and the deployed function names.

To deploy to a different stage, set the `env` environment variable in `serverless.yml` or pass `--stage`:

```bash
npx serverless deploy --stage prod
```

## Environment Variables

These are injected automatically via Serverless and CloudFormation refs — no `.env` file is needed for deployment.

| Variable | Source | Description |
|---|---|---|
| `env` | `serverless.yml` | Deployment stage (`dev` / `prod`) |
| `userPoolId` | CloudFormation `Ref` | Cognito User Pool ID |
| `userPoolClientId` | CloudFormation `Ref` | Cognito App Client ID |
| `region` | Provider config | AWS region (`eu-west-2`) |
| `IS_OFFLINE` | serverless-offline | Set to `true` during local development; switches DynamoDB to localhost |

## DynamoDB Table Naming

Tables follow the pattern `{table-name}-phishaware-{env}`, e.g.:
- `user-table-phishaware-dev`
- `email-table-phishaware-dev`
- `score-table-phishaware-dev`

All tables use on-demand (`PAY_PER_REQUEST`) billing and a single string hash key (`id`).
