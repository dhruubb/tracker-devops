pipeline {
  agent any

  stages {

    stage('Checkout') {
        steps {
            git branch: 'main', url: 'https://github.com/dhruubb/tracker-devops.git'
        }
        }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t tracker-app .'
      }
    }

    stage('Stop Old Container') {
      steps {
        sh '''
          docker stop tracker-app || true
          docker rm tracker-app || true
        '''
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          docker run -d -p 3000:3000 --name tracker-app tracker-app
        '''
      }
    }
  }
}