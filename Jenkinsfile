// pipeline {
//   agent any

//   stages {

//     stage('Check Docker') {
//       steps {
//         sh 'which docker'
//         sh 'docker --version'
//       }
//     }

//     stage('Checkout') {
//       steps {
//         git branch: 'main', url: 'https://github.com/dhruubb/tracker-devops.git'
//       }
//     }

//     stage('Build Docker Image') {
//       steps {
//         sh 'docker build -t tracker-app:latest .'
//       }
//     }

//     stage('Stop Old Container') {
//       steps {
//         sh '''
//           docker stop tracker-app || true
//           docker rm tracker-app || true
//         '''
//       }
//     }

//     stage('Run Container') {
//       steps {
//         sh '''
//           docker run -d \
//           -p 3000:3000 \
//           --name tracker-app \
//           tracker-app:latest
//         '''
//       }
//     }

//     stage('Verify Container') {
//       steps {
//         sh 'docker ps'
//         sh 'docker logs tracker-app --tail=50'
//       }
//     }
//     stage('Run Tests') {
//   steps {
//     sh 'npm install'
//     sh 'npm test'
//   }
// }
    
//   }
// }

pipeline {
    agent any

    environment {
        IMAGE_NAME = "dhruubb/tracker-app"
        TAG = "latest"
    }

    stages {

        stage('Check Docker & Kubectl') {
            steps {
                sh 'which docker'
                sh 'docker --version'

                sh 'which kubectl'
                sh 'kubectl version --client'
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/dhruubb/tracker-devops.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$TAG .'
            }
        }

        stage('DockerHub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh 'docker push $IMAGE_NAME:$TAG'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl apply -f k8s/

                    kubectl rollout restart deployment/tracker-app
                '''
            }
        }

        stage('Verify Kubernetes Deployment') {
            steps {
                sh 'kubectl get pods'
                sh 'kubectl get svc'
                sh 'kubectl get deployments'
            }
        }

        stage('Show App Logs') {
            steps {
                sh 'kubectl logs deployment/tracker-app --tail=30'
            }
        }
    }

    post {

        success {
            echo 'CI/CD Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}