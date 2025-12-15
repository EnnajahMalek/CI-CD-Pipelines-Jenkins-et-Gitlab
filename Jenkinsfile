pipeline {
    agent any

    environment {
        IMAGE_NAME = "my-image"
        REGISTRY_URL = "172.17.0.1:5000"
    }

    stages {

        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm test -- --coverage'
            }
        }

        stage('Docker Build') {
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
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
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
