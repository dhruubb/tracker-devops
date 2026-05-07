

// pipeline {
//     agent any

//     environment {
//         IMAGE_NAME = "dhruubb/tracker-app"
//         TAG = "latest"
//     }

//     stages {

//         stage('Check Docker & Kubectl') {
//             steps {
//                 sh 'which docker'
//                 sh 'docker --version'

//                 sh 'which kubectl'
//                 sh 'kubectl version --client'
//             }
//         }

//         stage('Checkout Code') {
//             steps {
//                 git branch: 'main',
//                 url: 'https://github.com/dhruubb/tracker-devops.git'
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm install'
//             }
//         }

//         stage('Run Tests') {
//             steps {
//                 sh 'npm test'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 sh 'docker build -t $IMAGE_NAME:$TAG .'
//             }
//         }

//        stage('DockerHub Login') {
//         steps {
//             withCredentials([usernamePassword(
//                 credentialsId: 'dockerhub-creds',
//                 usernameVariable: 'DOCKER_USER',
//                 passwordVariable: 'DOCKER_PASS'
//             )]) {
//                 sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
//             }
//         }
//     }

//         stage('Push Docker Image') {
//             steps {
//                 sh 'docker push $IMAGE_NAME:$TAG'
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 sh '''
//                     kubectl apply -f k8s/

//                     kubectl rollout restart deployment/tracker-app
//                 '''
//             }
//         }

//         stage('Verify Kubernetes Deployment') {
//             steps {
//                 sh 'kubectl get pods'
//                 sh 'kubectl get svc'
//                 sh 'kubectl get deployments'
//             }
//         }

//         stage('Show App Logs') {
//             steps {
//                 sh 'kubectl logs deployment/tracker-app --tail=30'
//             }
//         }
//     }

//     post {

//         success {
//             echo 'CI/CD Pipeline executed successfully!'
//         }

//         failure {
//             echo 'Pipeline failed!'
//         }
//     }
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
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
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

        // =========================
        // PROMETHEUS SETUP
        // =========================

        stage('Run Prometheus') {
            steps {
                sh '''
                    docker stop prometheus || true
                    docker rm prometheus || true

                    docker run -d \
                      --name prometheus \
                      -p 9090:9090 \
                      -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
                      prom/prometheus
                '''
            }
        }

        // =========================
        // CADVISOR SETUP
        // =========================

        stage('Run cAdvisor') {
            steps {
                sh '''
                    docker stop cadvisor || true
                    docker rm cadvisor || true

                    docker run -d \
                      --name=cadvisor \
                      -p 8080:8080 \
                      --volume=/:/rootfs:ro \
                      --volume=/var/run:/var/run:ro \
                      --volume=/sys:/sys:ro \
                      --volume=/var/lib/docker/:/var/lib/docker:ro \
                      gcr.io/cadvisor/cadvisor:latest
                '''
            }
        }

        // =========================
        // GRAFANA SETUP
        // =========================

        stage('Run Grafana') {
            steps {
                sh '''
                    docker stop grafana || true
                    docker rm grafana || true

                    docker run -d \
                      --name grafana \
                      -p 3001:3000 \
                      grafana/grafana
                '''
            }
        }

        // =========================
        // VERIFY MONITORING
        // =========================

        stage('Verify Monitoring Stack') {
            steps {
                sh 'docker ps'

                sh 'docker logs prometheus --tail=20'
                sh 'docker logs grafana --tail=20'
                sh 'docker logs cadvisor --tail=20'
            }
        }

        // =========================
        // SHOW URLS
        // =========================

        stage('Monitoring URLs') {
            steps {
                echo 'Prometheus: http://localhost:9090'
                echo 'Grafana: http://localhost:3001'
                echo 'cAdvisor: http://localhost:8080'
            }
        }
    }

    post {

        success {
            echo 'CI/CD + Monitoring Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}