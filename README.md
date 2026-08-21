# AWS Training - Amplify Gen 2 + React + Vite

A modern fullstack web application built with **React**, **Vite**, **TypeScript**, and **AWS Amplify Gen 2**. This project demonstrates how to connect a frontend web application to AWS cloud infrastructure using code-first backend definitions (Auth & Data).

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), TypeScript, Vanilla CSS with custom glassmorphism design.
- **Backend Infrastructure**: [AWS Amplify Gen 2](https://docs.amplify.aws/) (`@aws-amplify/backend`, `@aws-amplify/backend-cli`).
- **Authentication**: AWS Amplify Auth (Amazon Cognito).
- **Data & API**: AWS Amplify Data (GraphQL / AWS AppSync + Amazon DynamoDB).

---

## 📁 Project Structure (Will be updated while implementing other features)

```text
aws-training/
├── amplify/                  # AWS Amplify Gen 2 Backend definition
│   ├── auth/                 # Cognito Auth configuration
│   │   └── resource.ts
│   ├── data/                 # Data schema & GraphQL API configuration
│   │   └── resource.ts
│   ├── backend.ts            # Main backend entrypoint
│   └── tsconfig.json
├── src/                      # React Frontend source code
│   ├── App.tsx               # Main application component & Amplify Data client
│   ├── App.css               # Modern glassmorphism & component styles
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles and design system variables
├── amplify.yml               # AWS Amplify Hosting build spec
├── amplify_outputs.json      # Generated AWS configuration file (auto-generated)
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```

---

## 📋 Prerequisites

Before setting up the application, ensure you have the following installed:

1. **Node.js** (v20.x or later recommended)
2. **npm** (v10.x or later)
3. **AWS Account** and **AWS CLI** configured locally with appropriate credentials:
   ```bash
   aws configure
   ```

---

## 🚀 Getting Started / Setup

### 1. Clone the Repository

```bash
git clone https://github.com/quannguyen-agilityio/aws-training.git
cd aws-training
```

### 2. Install Dependencies

```bash
npm install
```

---

## 💻 Local Development Workflow

### Step 1: Start the Backend Sandbox (AWS Cloud Integration)

Amplify Gen 2 uses personal developer sandboxes to deploy isolated cloud resources in real time:

```bash
npm run amplify:sandbox
```

> **Note**: Running sandbox requires active AWS credentials in your environment. Upon deployment, Amplify CLI will automatically generate/update `amplify_outputs.json` in your project root.

### Step 2: Run the Development Server

In a separate terminal window, start the local Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to see the application running.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command                   | Description                                                                                      |
| :------------------------ | :----------------------------------------------------------------------------------------------- |
| `npm run dev`             | Runs the Vite development server in hot-reload mode.                                             |
| `npm run build`           | Compiles TypeScript and builds the app for production in the `dist` folder.                      |
| `npm run preview`         | Previews the production build locally.                                                           |
| `npm run lint`            | Runs ESLint to check for lint errors.                                                            |
| `npm run amplify:sandbox` | Provisions personal AWS sandbox environment for backend testing (`ampx sandbox`).                |
| `npm run amplify:outputs` | Generates or updates `amplify_outputs.json` from deployed AWS backend (`ampx generate outputs`). |
