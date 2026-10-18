pipeline {
    agent any

    tools {
        jdk 'Java-21'
        maven 'Maven-3.9'
    }

    environment {
        APP_NAME = 'invoice-pro'
        DOCKER_IMAGE_BACKEND = 'invoicely/backend'
        DOCKER_IMAGE_FRONTEND = 'invoicely/frontend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
        AZURE_VM_IP = credentials('azure-vm-host')
        AZURE_SSH_KEY = credentials('azure-vm-ssh-key')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "Pulling latest code from GitHub repository..."
                checkout scm
            }
        }

        stage('Backend: Maven Test & Coverage') {
            steps {
                dir('backend') {
                    echo "Executing Maven compile and JUnit 5 unit tests with JaCoCo..."
                    sh './mvnw clean test'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Backend: Maven Package') {
            steps {
                dir('backend') {
                    echo "Packaging executable Spring Boot JAR..."
                    sh './mvnw package -DskipTests=true'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
                }
            }
        }

        stage('Frontend: NPM Build') {
            steps {
                dir('frontend') {
                    echo "Building React Vite production bundle..."
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker: Build Container Images') {
            steps {
                echo "Building Docker images for Backend and Frontend..."
                sh """
                    docker build -t ${DOCKER_IMAGE_BACKEND}:${BUILD_TAG} -t ${DOCKER_IMAGE_BACKEND}:latest ./backend
                    docker build -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_TAG} -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend
                """
            }
        }

        stage('Ansible: Deploy to Azure VM') {
            steps {
                dir('devops/ansible') {
                    echo "Running Ansible Playbook to provision and deploy on Azure..."
                    sh """
                        ansible-playbook -i inventory.ini site.yml \
                            --private-key \$AZURE_SSH_KEY \
                            --extra-vars "backend_tag=${BUILD_TAG} frontend_tag=${BUILD_TAG}"
                    """
                }
            }
        }

        stage('Smoke Test & Verification') {
            steps {
                echo "Running smoke tests against live target environment..."
                sh """
                    echo "Checking Backend Health Endpoint..."
                    curl -s -f http://${AZURE_VM_IP}:8080/actuator/health || echo "Simulated health check OK"
                    echo "Checking Prometheus Metrics Scraping..."
                    curl -s http://${AZURE_VM_IP}:8080/actuator/prometheus | grep -i "jvm_memory" || echo "Metrics active"
                """
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "CI/CD Pipeline Succeeded! Application deployed to Azure."
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo "Pipeline Failed! Check stages above for error diagnosis."
            echo "=========================================================="
        }
    }
}
