# my-api-lambda

A lightweight REST API built with **Node.js + Express**, deployed to **AWS Lambda** via **serverless-http**.  
The project follows a clean, framework-conventional structure with full CI/CD powered by GitHub Actions.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Architecture](#architecture)
- [Endpoints](#endpoints)
- [Local Development](#local-development)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [CI / CD Pipeline](#ci--cd-pipeline)
- [Deploying to AWS Lambda (Manual)](#deploying-to-aws-lambda-manual)

---

## Project Purpose

`my-api-lambda` provides a production-ready API skeleton that runs both locally (as a standard Express HTTP server) and on AWS Lambda (via API Gateway + serverless-http adapter).  
No database is required — the application is purely stateless.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  AWS API Gateway (HTTP or REST API)     │
└─────────────────────────┬───────────────┘
                          │ proxy event
┌─────────────────────────▼───────────────┐
│  AWS Lambda  (src/handler.js)           │
│  ┌───────────────────────────────────┐  │
│  │  serverless-http  ←→  Express app │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Locally, `src/server.js` runs the same Express app on a plain HTTP server — no Lambda required.

---

## Endpoints

| Method | Path         | Description                        | Response                                  |
|--------|--------------|------------------------------------|-------------------------------------------|
| GET    | `/health`    | Liveness / health check            | `{"status":"ok"}`                         |
| GET    | `/api/info`  | Application metadata               | `{"name":"…","version":"…","db":"none"}`  |

---

## Local Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/my-api-lambda.git
cd my-api-lambda

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env as needed

# 4. Start the development server (auto-reloads via nodemon)
npm run dev

# The API is now available at http://localhost:3000
```

---

## Running with Docker

```bash
# Build the runtime image
docker build --target runtime -t my-api-lambda:local .

# Run the container
docker run --rm \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e APP_NAME=my-api-lambda \
  -e APP_VERSION=1.0.0 \
  my-api-lambda:local

# The API is now available at http://localhost:3000
```

To run lint + tests inside Docker:

```bash
docker build --target test -t my-api-lambda:test .
```

---

## Environment Variables

All variables are listed in `.env.example`. Copy it to `.env` for local use.

| Variable               | Required | Default          | Description                                             |
|------------------------|----------|------------------|---------------------------------------------------------|
| `APP_NAME`             | No       | `my-api-lambda`  | Application name returned by `/api/info`                |
| `APP_VERSION`          | No       | `1.0.0`          | Application version returned by `/api/info`             |
| `NODE_ENV`             | No       | `development`    | Runtime environment (`development` / `production`)      |
| `PORT`                 | No       | `3000`           | HTTP port used by the local server (not used in Lambda) |
| `AWS_REGION`           | CI only  | `us-east-1`      | AWS region for deployment (set as GitHub secret)        |
| `AWS_ACCESS_KEY_ID`    | CI only  | —                | AWS IAM access key (set as GitHub secret)               |
| `AWS_SECRET_ACCESS_KEY`| CI only  | —                | AWS IAM secret key (set as GitHub secret)               |
| `LAMBDA_FUNCTION_NAME` | CI only  | —                | Name of the Lambda function to update (GitHub secret)   |
| `LAMBDA_ROLE_ARN`      | No       | —                | IAM role ARN (used during manual Lambda creation only)  |

> **Security**: Never commit `.env` or real credentials. Use GitHub Actions secrets for CI/CD.

---

## Testing

```bash
# Run all tests with coverage
npm test

# Run lint only
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

Test files live in `src/__tests__/` and use **Jest** + **Supertest**.

---

## CI / CD Pipeline

The GitHub Actions workflow at `.github/workflows/deploy.yml` runs four jobs:

| Job      | Trigger          | Description                                             |
|----------|------------------|---------------------------------------------------------|
| `lint`   | Every push / PR  | Runs ESLint; fails on any warning                       |
| `test`   | After lint       | Runs Jest tests and uploads coverage artifact           |
| `build`  | After test       | Installs prod deps, creates `function.zip` artifact     |
| `deploy` | Push to `main`   | Downloads artifact, updates Lambda code & config        |

### Required GitHub Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret                   | Description                              |
|--------------------------|------------------------------------------|
| `AWS_ACCESS_KEY_ID`      | IAM user access key with Lambda access   |
| `AWS_SECRET_ACCESS_KEY`  | IAM user secret key                      |
| `AWS_REGION`             | e.g. `us-east-1`                         |
| `LAMBDA_FUNCTION_NAME`   | Name of your existing Lambda function    |

---

## Deploying to AWS Lambda (Manual)

### 1. Create the Lambda function (first time only)

```bash
# Package the app
npm ci --omit=dev
zip -r function.zip src/ node_modules/ package.json

# Create the function
aws lambda create-function \
  --function-name my-api-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler src/handler.handler \
  --zip-file fileb://function.zip \
  --region us-east-1
```

### 2. Configure API Gateway

Create an **HTTP API** in API Gateway, add a route `ANY /{proxy+}` pointing to your Lambda function, and deploy the stage. API Gateway will forward all requests to the Lambda handler.

### 3. Update an existing function

```bash
npm ci --omit=dev
zip -r function.zip src/ node_modules/ package.json

aws lambda update-function-code \
  --function-name my-api-lambda \
  --zip-file fileb://function.zip \
  --region us-east-1
```

---

## License

MIT