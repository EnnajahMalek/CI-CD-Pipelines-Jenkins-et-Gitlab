pipeline {
    agent none

    environment {
        IMAGE_NAME = "my-image"
        REGISTRY_URL = "172.18.0.2:5000"
    }

    stages {

        stage('Build & Test') {
            agent {
                docker {
                    image 'node:20'
                    args '-u root'
                }
            }
            steps {
                // Use npm cache to speed up builds
                sh 'npm ci --cache /tmp/npm_cache'
                sh 'npm test -- --coverage'
            }
        }

        stage('Docker Build') {
            agent {
                docker {
                    image 'docker:25'
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                sh '''
                  docker build \
                    -t $IMAGE_NAME:latest \
                    -t $REGISTRY_URL/$IMAGE_NAME:latest \
                    .
                '''
            }
        }

        stage('Docker Push') {
            agent {
                docker {
                    image 'docker:25'
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                // Direct push, no login
                sh '''
                  docker push $REGISTRY_URL/$IMAGE_NAME:latest
                '''
            }
        }

        stage('Deploy Local') {
            agent {
                docker {
                    image 'docker:25'
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                sh '''
                  docker rm -f tp-gitlab-ci || true
                  docker pull $REGISTRY_URL/$IMAGE_NAME:latest
                  docker run -d \
                    --name tp-gitlab-ci \
                    -p 3000:3000 \
                    $REGISTRY_URL/$IMAGE_NAME:latest
                '''
            }
        }
    }
}
