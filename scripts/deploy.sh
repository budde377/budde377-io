#!/usr/bin/env bash

npm run build
docker build -t budde377/budde377-io:latest .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
docker push budde377/budde377-io:latest
