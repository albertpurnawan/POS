pipeline {
  agent any

  environment {
    IMAGE_NAME = 'your-dockerhub-username/pos-bolt'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    DOCKER_CREDS = 'dockerhub-credentials'

    // Deployment parameters (fill these in Jenkins or edit here)
    DEPLOY_HOST = 'your-server.example.com'
    DEPLOY_USER = 'ubuntu'
    DEPLOY_SSH_CREDENTIALS = 'deploy-ssh-key'
    DEPLOY_APP_NAME = 'pos-bolt'
    DEPLOY_PORT = '8080'
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install deps') {
      agent { docker { image 'node:20-alpine' } }
      steps {
        sh 'npm ci --no-audit --no-fund'
      }
    }

    stage('Lint') {
      agent { docker { image 'node:20-alpine' } }
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build') {
      agent { docker { image 'node:20-alpine' } }
      steps {
        sh 'npm run build'
        sh 'ls -la dist || true'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
        sh 'docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest'
      }
    }

    stage('Docker Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push ${IMAGE_NAME}:${IMAGE_TAG}'
          sh 'docker push ${IMAGE_NAME}:latest'
        }
      }
    }

    stage('Deploy') {
      when { branch 'main' }
      steps {
        sshagent(credentials: [env.DEPLOY_SSH_CREDENTIALS]) {
          withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              set -e
              # Copy deploy script to server
              scp -o StrictHostKeyChecking=no scripts/deploy.sh ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/deploy-pos-bolt.sh
              # Execute deploy script with required env vars
              ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                "chmod +x /tmp/deploy-pos-bolt.sh && \
                 IMAGE_NAME=${IMAGE_NAME} IMAGE_TAG=${IMAGE_TAG} CONTAINER_NAME=${DEPLOY_APP_NAME} PORT=${DEPLOY_PORT} \
                 DOCKER_USER=\"$DOCKER_USER\" DOCKER_PASS=\"$DOCKER_PASS\" \
                 /tmp/deploy-pos-bolt.sh"
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Build/Push/Deploy succeeded.'
    }
    failure {
      echo 'Pipeline failed.'
    }
    always {
      cleanWs()
    }
  }
}

