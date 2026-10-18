# Invoice Pro - Enterprise Invoice Management System with End-to-End DevOps Pipeline

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Build-Maven-C71A36.svg)](https://maven.apache.org/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20Vite-61DAFB.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Jenkins](https://img.shields.io/badge/CI-Jenkins%20Declarative-D24939.svg)](https://www.jenkins.io/)
[![Ansible](https://img.shields.io/badge/Config%20Mgmt-Ansible-EE0000.svg)](https://www.ansible.com/)
[![Azure Pipelines](https://img.shields.io/badge/Cloud%20CD-Azure%20Pipelines-0078D4.svg)](https://azure.microsoft.com/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus%20%26%20Grafana-E6522C.svg)](https://prometheus.io/)

---

## 📌 Project Overview

**Course Code:** CS23016 - DevOps  
**Project Title:** End-to-End CI/CD Pipeline Implementation & Configuration Management for an Enterprise Multi-Tier Invoice Management System on Microsoft Azure  
**Team Members:**
- Harsanth R (2023103565)
- Sachin K (2023103595)
- Pradeep Balaji T (2023103544)

This project transitions a legacy billing application into an enterprise-ready, multi-tier system composed of a **React 18 SPA frontend**, a **Java 21 / Spring Boot 3 REST API**, and a **PostgreSQL** database, fully automated through industry-standard DevOps practices:
- **Build Automation & Testing:** Apache Maven with JUnit 5 and JaCoCo coverage reports.
- **Continuous Integration (CI):** Jenkins declarative pipeline triggered via GitHub webhooks.
- **Configuration Management:** Ansible role-based playbooks for zero-touch server provisioning.
- **Continuous Deployment (CD):** Microsoft Azure DevOps Pipelines deploying to Azure Virtual Machines.
- **Observability:** Prometheus scraping Spring Boot Actuator metrics (`/actuator/prometheus`) visualized via real-time Grafana dashboards.

---

## 🏗️ Architecture & DevOps Workflow

```
[Developer] ──> Git Commit & Push ──> [GitHub Repository]
                                             │ (Webhook)
                                             ▼
                                     [Jenkins CI Server]
                      ┌──────────────────────┼──────────────────────┐
                      ▼                      ▼                      ▼
               [Maven Test &]         [React Vite]           [Docker Build]
               [JaCoCo Coverage]      [NPM Build]            [Containerization]
                      │                      │                      │
                      └──────────────────────┴──────────────────────┘
                                             │
                                             ▼
                                 [Azure DevOps CD Pipeline]
                                             │
                                             ▼ (Triggers)
                                     [Ansible Engine]
                                             │ (SSH / Playbook)
                                             ▼
                                   [Azure Linux VM Host]
                      ┌──────────────────────┼──────────────────────┐
                      ▼                      ▼                      ▼
                 [Nginx:80]           [Spring Boot:8080]      [PostgreSQL:5432]
               (React Assets)          (REST API + Actuator)    (Data Persistence)
                                             │
                                             ▼
                                   [Prometheus & Grafana]
                                    (Metrics & Telemetry)
```

---

## 🚀 Key Functional Features

1. **Authentication & Multi-Tenancy:** Secure JWT Bearer authentication with BCrypt password hashing.
2. **Client Management:** Comprehensive client records with address, contact info, and billing history.
3. **Dynamic Invoice Engine:** Multi-item invoice builder with precision tax, discount, and grand total calculations (`BigDecimal`).
4. **Corporate PDF Generation:** Instant high-fidelity PDF invoice creation via OpenPDF (`com.github.librepdf:openpdf`).
5. **Automated Status Scheduling:** Spring `@Scheduled` background cron job automatically transitioning overdue invoices.
6. **Email Dispatch:** Direct invoice emailing with PDF attachments using Spring Mail.
7. **Production Telemetry:** Out-of-the-box Micrometer Prometheus metrics at `/actuator/prometheus`.

---

## 💻 Quick Start & Running Locally

### Option 1: Full-Stack Docker Compose (Recommended)
Launch PostgreSQL, Spring Boot Backend, React Frontend, Prometheus, and Grafana with one command:
```bash
docker-compose up --build -d
```
Access points:
- **Frontend Application:** http://localhost:3000
- **Backend API & Swagger:** http://localhost:8080
- **Actuator Health:** http://localhost:8080/actuator/health
- **Prometheus Metrics:** http://localhost:8080/actuator/prometheus
- **Prometheus Server:** http://localhost:9090
- **Grafana Dashboards:** http://localhost:3001 (User: `admin`, Password: `admin`)

---

### Option 2: Running Without Docker (Direct Native Execution)

#### 1. Backend (Spring Boot 3 + Java 21)
The backend comes with an embedded Maven wrapper (`mvnw.cmd` on Windows, `./mvnw` on Linux/Mac) and an in-memory H2 profile for zero-config local testing:
```bash
cd backend

# Run automated JUnit 5 tests & generate JaCoCo coverage:
.\mvnw.cmd test          # Windows
# or: ./mvnw test        # Linux/macOS

# Start Spring Boot application on port 8080:
.\mvnw.cmd spring-boot:run
```

#### 2. Frontend (React 18 + Vite)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🛠️ DevOps Toolchain Details

### 1. Maven (`backend/pom.xml`)
- Compiles Java 21 source code.
- Runs JUnit 5 test suites (`InvoiceServiceTest`, `AuthControllerTest`).
- Generates test coverage report via `jacoco-maven-plugin` at `target/site/jacoco/index.html`.
- Repackages the application into an executable fat JAR: `target/invoice-backend-1.0.0-SNAPSHOT.jar`.

### 2. Jenkins Pipeline (`Jenkinsfile`)
Declarative CI pipeline featuring 7 distinct stages:
1. `Checkout SCM`: Clones code from GitHub.
2. `Backend: Maven Test & Coverage`: Runs `./mvnw clean test` and records JUnit results.
3. `Backend: Maven Package`: Produces deployable JAR artifact.
4. `Frontend: NPM Build`: Executes `npm run build` producing production React bundles.
5. `Docker: Build Container Images`: Builds Docker images for backend & frontend.
6. `Ansible: Deploy to Azure VM`: Provisions target Azure server via Ansible.
7. `Smoke Test & Verification`: Curls `/actuator/health` and verifies service availability.

### 3. Ansible Automation (`devops/ansible/`)
Idempotent configuration management consisting of four modular roles:
- `roles/common`: Updates system packages, installs OpenJDK 21, curl, git, and configures UFW firewall (ports 22, 80, 8080, 9090, 3001).
- `roles/postgres`: Installs PostgreSQL, provisions `invoicedb`, and configures secure database users.
- `roles/backend`: Deploys `app.jar`, sets up systemd service `/etc/systemd/system/invoice-backend.service`, and manages environment secrets.
- `roles/frontend`: Deploys React bundle to `/var/www/invoice-pro-frontend` and configures Nginx reverse proxy.

Run Ansible playbook:
```bash
cd devops/ansible
ansible-playbook -i inventory.ini site.yml
```

### 4. Azure DevOps Pipelines (`azure-pipelines.yml`)
Multi-stage enterprise pipeline for Microsoft Azure:
- **Stage 1 (Build & Test):** Runs Maven test + JaCoCo coverage + NPM build in parallel agents, publishes build drops.
- **Stage 2 (Containerize):** Builds Docker images and tags with Azure Build ID.
- **Stage 3 (Deploy to Azure):** Connects to Azure target VM or App Service, runs Ansible deployment, and validates endpoint health.

---

## 📊 Live Demonstration Script for Examiners

Follow this step-by-step sequence during your project evaluation:

1. **The Code Trigger (1 min):**
   - Make a minor change (e.g., in UI title or backend version) and push:
     ```bash
     git add .
     git commit -m "feat: enhance invoice tax calculation"
     git push origin main
     ```
2. **Jenkins CI Dashboard (2 mins):**
   - Show the Jenkins pipeline running automatically upon GitHub webhook.
   - Click into the stage view: show **Maven Test**, the passing JUnit tests (4/4 tests), and JaCoCo coverage graph.
3. **Ansible & Azure Deployment (2 mins):**
   - Show the Ansible playbook terminal output: point out `changed: [azure-vm]` for tasks.
   - Explain how Ansible ensures idempotency (running the playbook again shows `ok` with 0 changes).
4. **Live Application Walkthrough (3 mins):**
   - Open the live application on Azure IP / port 80.
   - Register user `Pradeep Balaji`, login.
   - Create a client `Tata Consultancy Services`.
   - Create an invoice with items, click **Download PDF** to show the generated PDF.
   - Click **Send Email** and **Mark as Paid**.
5. **Observability via Prometheus & Grafana (2 mins):**
   - Open Prometheus (`:9090`) and show the target `backend:8080` in `UP` state.
   - Open Grafana (`:3001`): display live JVM memory, HikariCP database connections, and HTTP request throughput spiking as you click around the app.
