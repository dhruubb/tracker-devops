pipeline {
  agent any

  stages {

    stage('Clone Repo') {
      steps {
        git branch: 'main', url: 'https://github.com/dhruubb/tracker-devops.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t tracker-app .'
      }
    }

    stage('Run Container') {
      steps {
        sh 'docker compose up -d'
      }
    }
  }
}