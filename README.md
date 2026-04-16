# DevSecOps Demo

A simple TypeScript/Express.js REST API used to demonstrate how to integrate security scanning tools into a GitHub Actions CI/CD pipeline.

## Overview

This project shows how to shift security left by running three industry-standard tools automatically on every pull request:

| Tool | Type | What it catches |
|------|------|-----------------|
| [SonarCloud](https://sonarcloud.io) | SAST (Static Analysis) | Code quality issues, security hotspots, coverage |
| [OWASP ZAP](https://www.zaproxy.org) | DAST (Dynamic Analysis) | Runtime vulnerabilities against a live endpoint |
| [Trivy](https://trivy.dev) | Container & Dependency Scanning | CVEs in npm packages and OS-level Docker image layers |

## Application

A simple in-memory REST API — no database required.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — used by ZAP to confirm the app is ready |
| `GET` | `/api/items` | List all items |
| `GET` | `/api/items/:id` | Get a single item |
| `POST` | `/api/items` | Create an item `{ "name": "...", "description": "..." }` |
| `DELETE` | `/api/items/:id` | Delete an item |

### Run locally

```bash
npm install
npm run dev        # ts-node src/server.ts — http://localhost:3000
```

### Run tests

```bash
npm test           # Jest with coverage — outputs coverage/lcov.info
```

### Build and run with Docker

```bash
docker build -t devsecops-demo .
docker run -p 3000:3000 devsecops-demo
curl http://localhost:3000/health
```

## CI Pipeline — `CI-PR.yaml`

Triggered on every pull request targeting `main`. All three jobs run in parallel.

```
pull_request
    │
    ├── sonar-sast    (SonarCloud — static analysis + coverage)
    ├── zap-dast      (OWASP ZAP — dynamic scan against running container)
    └── trivy-scan    (Trivy — filesystem deps + Docker image CVEs)
```

### Job: `sonar-sast`

1. Checks out code with full git history (`fetch-depth: 0`)
2. Installs dependencies and runs tests to generate coverage
3. Sends results to SonarCloud via `SonarSource/sonarqube-scan-action`

**Required secrets:** `SONAR_TOKEN`, `SONAR_HOST_URL`

### Job: `zap-dast`

1. Builds the Docker image
2. Starts the container on port 3000
3. Polls `/health` until the app is ready (30 retries × 2s)
4. Runs the ZAP Baseline Scan against `http://localhost:3000`
5. Uploads the ZAP report as a workflow artifact

### Job: `trivy-scan`

1. **Filesystem scan** — scans `package.json` / `node_modules` for vulnerable npm packages
2. **Image scan** — builds the Docker image and scans OS-level packages in the final image
3. Uploads both results as SARIF to the GitHub Security tab

> **Security note — Trivy supply chain attack (March 19, 2026)**
>
> The `aquasecurity/trivy-action` GitHub Action was compromised when a threat actor
> force-pushed malicious commits to 76 of 77 version tags. The workflow pins to the
> full immutable commit SHA (`57a97c7e...`) rather than a version tag, which cannot
> be redirected. The same SHA-pinning approach is applied to the ZAP action.
>
> To re-verify the SHA yourself:
> ```bash
> git ls-remote https://github.com/aquasecurity/trivy-action.git refs/tags/0.35.0
> # Expected prefix: 57a97c7e
> ```

## Setup

### 1. SonarCloud

1. Sign in to [sonarcloud.io](https://sonarcloud.io) with your GitHub account
2. Create a new organization linked to your GitHub account
3. Import this repository as a new project
4. Select **"With GitHub Actions"** as the analysis method and disable automatic analysis
5. Copy the generated token
6. Update `sonar-project.properties` with your organization and project keys:
   ```properties
   sonar.organization=YOUR_SONARCLOUD_ORG_KEY
   sonar.projectKey=YOUR_SONARCLOUD_PROJECT_KEY
   ```

### 2. GitHub Secrets

Add these secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `SONAR_TOKEN` | Token from sonarcloud.io → My Account → Security |
| `SONAR_HOST_URL` | `https://sonarcloud.io` |

`GITHUB_TOKEN` is provided automatically by Actions — no configuration needed.

### 3. GitHub Advanced Security

Trivy uploads results in SARIF format to the GitHub Security tab. For this to work:

- **Public repos:** enabled by default
- **Private repos:** requires GitHub Advanced Security (GHAS) to be enabled under **Settings → Security & analysis**

## Project Structure

```
devsecops-demo/
├── src/
│   ├── app.ts              # Express app factory
│   ├── server.ts           # Entry point (binds to 0.0.0.0:3000)
│   └── routes/
│       └── items.ts        # In-memory CRUD routes
├── tests/
│   └── app.test.ts         # supertest integration tests
├── Dockerfile              # Multi-stage build, non-root user
├── .dockerignore
├── package.json
├── tsconfig.json
├── sonar-project.properties
└── .github/
    └── workflows/
        └── CI-PR.yaml      # Security scanning pipeline
```
