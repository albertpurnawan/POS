pipeline {
  agent any

  environment {
    REGISTRY = credentials('dockerhub-credentials')
    IMAGE_NAME = 'your-dockerhub-username/pos'
    IMAGE_TAG = "${env.BUILD_NUMBER}"

    // Deployment parameters (fill these in Jenkins or edit here)
    DEPLOY_HOST = 'your-server.example.com'
    DEPLOY_USER = 'ubuntu'
    DEPLOY_SSH_CREDENTIALS = 'deploy-ssh-key'
    DEPLOY_APP_NAME = 'pos-app'
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
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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
          withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              set -e
              ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin && \
                 docker pull ${IMAGE_NAME}:${IMAGE_TAG} && \
                 docker container rm -f ${DEPLOY_APP_NAME} || true && \
                 docker run -d --restart unless-stopped --name ${DEPLOY_APP_NAME} -p ${DEPLOY_PORT}:80 ${IMAGE_NAME}:${IMAGE_TAG}"
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Build and push succeeded.'
    }
    failure {
      echo 'Build or push failed.'
    }
    always {
      cleanWs()
    }
  }
}
