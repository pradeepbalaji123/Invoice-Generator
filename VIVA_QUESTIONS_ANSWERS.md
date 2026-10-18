# DevOps Viva & Oral Defense Preparation Guide
**Course:** CS23016 - DevOps  
**Project:** Enterprise Invoice Management System CI/CD Pipeline

---

### Q1: Why did you use Maven instead of Gradle or manual compilation?
**Answer:**
> "Maven provides a standardized declarative build lifecycle (`validate` $\to$ `compile` $\to$ `test` $\to$ `package` $\to$ `verify` $\to$ `install` $\to$ `deploy`). In our project, Maven coordinates dependency management, runs automated JUnit 5 tests via `maven-surefire-plugin`, enforces code quality with `jacoco-maven-plugin`, and packages a self-contained Spring Boot executable JAR with `spring-boot-maven-plugin`. Furthermore, by including the Maven Wrapper (`mvnw`), our CI/CD pipelines in Jenkins and Azure do not require pre-installed local Maven binaries, making builds 100% reproducible."

---

### Q2: What is the difference between Jenkins Declarative Pipeline and Scripted Pipeline? Which one did you use?
**Answer:**
> "We used the modern **Declarative Pipeline** syntax (`pipeline { agent any ... }`). Declarative pipelines offer a strictly defined, readable structure with predefined blocks (`stages`, `stage`, `steps`, `post`, `options`). It provides better syntax validation, built-in post-build actions (`always`, `success`, `failure`), and native integration with the Jenkins Blue Ocean UI. Scripted pipelines, while powerful, rely on Groovy scripting which is more error-prone and harder to maintain across DevOps teams."

---

### Q3: What is Idempotency in Ansible and why is it critical for your deployment?
**Answer:**
> "Idempotency is the principle that executing an operation multiple times produces the exact same result without unintended side effects. In our project, if we run our Ansible playbook against our Azure VM:
> - If PostgreSQL, Java, and Nginx are already installed, Ansible reports `ok: [azure-vm]` and does not reinstall or interrupt existing services.
> - If a file has changed (like `app.jar`), Ansible updates only that file and reports `changed: [azure-vm]`.
> This guarantees safe, repeatable, and automated deployments without server configuration drift."

---

### Q4: How does your pipeline deploy to Microsoft Azure?
**Answer:**
> "We implemented two flexible paths for Azure deployment:
> 1. **Ansible over SSH to Azure Linux VM:** The CI pipeline invokes Ansible using SSH credentials stored in Azure Key Vault / Jenkins Credentials to configure the virtual machine, install runtime dependencies, deploy the Spring Boot systemd service, and configure Nginx reverse proxy.
> 2. **Azure Pipelines YAML (`azure-pipelines.yml`):** A multi-stage pipeline running on Microsoft-hosted `ubuntu-latest` agents that builds the Maven artifact, builds the React frontend, packages them into Docker images tagged with `$(Build.BuildId)`, and releases to our Azure environment with zero downtime."

---

### Q5: How does Prometheus monitor Spring Boot, and what metrics are exposed?
**Answer:**
> "We integrated **Spring Boot Actuator** and **Micrometer Prometheus Registry** (`micrometer-registry-prometheus`). Actuator exposes a dedicated endpoint at `/actuator/prometheus` formatted in open Prometheus exposition format.
> Prometheus scrapes this endpoint every 5 seconds. Key metrics include:
> - `jvm_memory_used_bytes` / `jvm_memory_max_bytes`: JVM Heap and Non-Heap allocation.
> - `http_server_requests_seconds_count`: Request throughput and status code breakdown (2xx, 4xx, 5xx).
> - `hikaricp_connections_active`: Database connection pool utilization.
> These metrics are rendered in Grafana dashboards for real-time observability."

---

### Q6: How do you handle secrets (DB passwords, JWT keys, SMTP credentials) in your DevOps pipeline?
**Answer:**
> "No secrets are hardcoded in the source repository:
> 1. In development, variables default to safe fallbacks or local environment variables.
> 2. In Jenkins, credentials are stored in the Jenkins Credentials Store and bound to pipeline environment variables (`credentials('azure-vm-ssh-key')`).
> 3. In Azure Pipelines, secrets are configured via Azure DevOps Secret Variables and Azure Key Vault.
> 4. On the target server, Ansible injects secrets into protected configuration files (`/etc/invoice-backend.env` with `mode: '0600'`) readable only by the application service account."

---

### Q7: What is the difference between Continuous Integration (CI), Continuous Delivery (CD), and Continuous Deployment?
**Answer:**
> - **Continuous Integration (CI):** Automating code merging, building, and running automated tests (Maven JUnit 5 tests) on every commit.
> - **Continuous Delivery (CD):** Ensuring code is always in a deployable state, with deployment to production requiring manual approval.
> - **Continuous Deployment:** Automatically deploying every build that passes all testing stages straight to the production environment without manual human intervention. Our project demonstrates full Continuous Deployment."
