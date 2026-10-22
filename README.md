# FinWise – Personal Finance & Payment Safety Assistant

A privacy-focused personal finance and digital payment safety application designed for everyday users in India. FinWise helps users understand their financial health, evaluate unusual transactions, and review potential payment risks through a simple, multilingual interface.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Supported Languages](#supported-languages)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Privacy and Disclaimer](#privacy-and-disclaimer)

## Overview

FinWise combines financial health analysis, rule-based transaction risk assessment, and coordinated analysis modules in one application.

The application is designed to make financial information easier to understand through plain-language explanations, transparent calculations, and practical suggestions.

Key principles:

- **Simple and understandable:** Financial metrics and risk assessments are explained in accessible language.
- **Privacy-conscious:** The application is designed to run locally, using its configured database and backend.
- **Transparent calculations:** Financial assessments and transaction risk scores use defined rules and calculations.
- **Multilingual interface:** Users can switch between supported Indian languages.
- **India-focused:** Currency formatting and payment safety information are tailored to Indian users.

## Features

### 1. Financial Health and Advisory

- Calculates monthly income, expenses, and remaining balance.
- Estimates the proportion of income spent.
- Estimates how long current savings could cover essential expenses.
- Provides practical budgeting and savings suggestions based on the available information.

### 2. Fraud and Transaction Risk Detection

- Evaluates transaction amounts against typical payment amounts.
- Checks for unusual transaction frequency.
- Considers unfamiliar recipients when the relevant information is provided.
- Classifies assessed transactions into risk levels such as Low, Medium, and High.
- Provides explanations and recommended precautions.

These assessments use defined rules and are intended to help users identify transactions that deserve additional attention.

### 3. Transaction History

- Records evaluated transactions when persistence is enabled.
- Supports reviewing previous risk assessments.
- Provides transaction history and filtering capabilities according to the implemented interface.

### 4. Coordinated Analysis Modules

FinWise organizes its analysis into separate modules:

- **Coordinator Agent:** Selects and coordinates analysis steps for supported requests.
- **Financial Advisory Agent:** Calculates financial metrics and produces budgeting recommendations.
- **Fraud Detection Agent:** Evaluates transaction information using risk-scoring rules.
- **Financial Health Analysis:** Combines relevant financial information into a summary when supported by the configured workflow.

The current implementation primarily uses deterministic calculations, predefined rules, and coordinated execution. These modules should not be interpreted as fully autonomous or LLM-powered agents unless such functionality is explicitly configured.

### 5. Knowledge Base

- Provides access to supported financial and payment-safety information.
- Retrieves relevant information using the application's configured retrieval logic.

### 6. Multilingual Interface

- Switches between supported languages.
- Uses translation resources and fallback text to keep the interface understandable.

## System Architecture

```text
                 User / Web Browser
                         |
                         v
              React Frontend (Vite)
                         |
             Language and UI Context
                         |
                         v
               Express REST API
                         |
                         v
                Coordinator Agent
                         |
              +----------+----------+
              |                     |
              v                     v
      Financial Advisory      Fraud Detection
            Agent                   Agent
              |                     |
              +----------+----------+
                         |
                         v
              Financial Health Summary
                and Risk Explanations
                         |
                         v
              Configured Data Storage
               and Transaction History
```

This diagram represents the logical application structure. The exact execution path and persistence behavior depend on the configured backend routes and modules.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling | CSS and responsive UI components |
| Backend | Node.js, Express.js |
| Data storage | SQLite, where configured |
| API communication | REST APIs |
| Internationalisation | React Context and translation resources |
| Testing | Node.js test runner and project test scripts |

## Supported Languages

The interface is designed to support:

- English
- ಕನ್ನಡ — Kannada
- हिन्दी — Hindi
- தமிழ் — Tamil
- తెలుగు — Telugu

Language availability depends on the translations included in the current application.

## Getting Started

### Prerequisites

- Node.js compatible with the project's dependencies
- npm
- Git, if cloning the repository

### 1. Clone the repository

```bash
git clone https://github.com/ChandanaBN3/financial-ai-agent.git
cd financial-ai-agent
```

### 2. Install dependencies

```bash
npm run setup
```

If the setup script is unavailable in your current version, install dependencies using the instructions in the root and package-specific `package.json` files.

### 3. Start development mode

```bash
npm run dev
```

If the configured scripts start both applications together, use these local addresses:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

The actual ports depend on your local configuration.

### 4. Build for production

```bash
npm run build
```

To start the backend in production mode, use the start script defined in the root `package.json`. For example, if the configured script is named `start:server`:

```bash
npm run start:server
```

Then open the backend's configured local address in your browser.

## API Reference

The following endpoints are documented for the application's API. Confirm their availability against the current backend implementation.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Reports service health and available status information |
| POST | `/api/advisory/calculate` | Calculates financial metrics and advisory results |
| POST | `/api/fraud/evaluate` | Evaluates transaction risk |
| GET | `/api/transactions` | Retrieves transaction history |
| GET | `/api/dashboard/summary` | Retrieves dashboard summary data |
| POST | `/api/demo/reset` | Resets demo transaction records, if enabled |

Request fields, validation rules, response formats, and database behavior are defined by the backend implementation.

## Testing

Run the project's configured test suite:

```bash
npm test
```

Additional verification scripts may be available under the `server/test` directory.

Testing may cover:

- Financial calculations and input validation
- Transaction risk scoring
- API endpoints
- Data persistence
- Knowledge retrieval
- Agent coordination and fallback handling

Test counts and pass/fail results should be updated only after running the current test suite successfully.

## Privacy and Disclaimer

### Privacy

FinWise is intended to support local financial analysis. Data handling depends on the application's current database configuration, deployment environment, and API integrations.

Do not enter banking passwords, UPI PINs, OTPs, card security codes, or other confidential authentication information into the application.

### Financial Information

FinWise provides general budgeting calculations and informational suggestions. It is not a substitute for advice from a qualified financial professional.

### Payment Safety

Transaction risk classifications are indicative assessments, not guarantees. A low-risk result does not establish that a payment is safe, and a high-risk result does not prove fraud.

Before transferring money, independently verify the recipient and payment details. Never disclose your UPI PIN or OTP to another person.

For suspected cyber financial fraud in India, contact the official cybercrime reporting service or call **1930** as soon as possible.

---

FinWise — Clearer financial insights. More informed payment decisions.