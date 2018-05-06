#!/usr/bin/env bash

set -e

mkdir ~/.kube

echo "
apiVersion: v1
kind: Config
clusters:
- name: default-cluster
  cluster:
    certificate-authority-data: ${KUBERNETES_CA}
    server: https://budde377.io:6443
contexts:
- name: default-context
  context:
    cluster: default-cluster
    namespace: default
    user: travis
current-context: default-context
users:
- name: travis
  user:
    token: ${KUBERNETES_TOKEN}
" > ~/.kube/config

npm run build
docker build -t budde377/budde377-io:$TRAVIS_COMMIT .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
docker push budde377/budde377-io:$TRAVIS_COMMIT

helm upgrade --wait --timeout 300 -i \
  --set image.tag=$TRAVIS_COMMIT \
  --set server.key=$SERVER_KEY \
  --set auth.clientSecret=$AUTH_CLIENT_SECRET \
  budde377-io ./helm/budde377-io
