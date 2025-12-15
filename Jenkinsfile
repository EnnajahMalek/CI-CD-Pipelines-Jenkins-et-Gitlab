pipeline {
    agent none

    environment {
        IMAGE_NAME = "my-image"
        REGISTRY_URL = "172.17.0.1:5000"
    }

    stages {

        stage('Build & Test') {
            agent {
                docker {
                    image 'node:20'
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm test -- --coverage'
            }
        }

        stage('Docker Build') {
            agent {
                docker {
                    image 'docker:25'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
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
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds1',
                    usernameVariable: 'NEXUS_USERNAME',
                    passwordVariable: 'NEXUS_PASSWORD'
                )]) {
                    sh '''
                      echo "$NEXUS_PASSWORD" | docker login $REGISTRY_URL \
                        -u "$NEXUS_USERNAME" --password-stdin
                      docker push $REGISTRY_URL/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy Local') {
            agent {
                docker {
                    image 'docker:25'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
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
