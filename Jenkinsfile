pipeline {
    agent none

    environment {
        IMAGE_NAME = "my-image"
        REGISTRY_URL = "172.17.0.1:5000"
    }

    options {
        skipDefaultCheckout()  // Prevent Jenkins from checking out automatically
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
                // Start with a clean workspace
                deleteDir()
                checkout scm

                // npm install/test inside container with unsafe-perm
                sh '''
                  rm -rf node_modules
                  npm ci --unsafe-perm
                  npm test -- --coverage
                '''
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
