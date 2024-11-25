#!/bin/bash

set -x

sudo yum update -y
sudo dnf install java-17-amazon-corretto -y
sudo yum install git -y
sudo yum install docker -y
sudo groupadd docker
sudo usermod -aG docker ec2-user
sudo service docker start
sudo chmod 777 /var/run/docker.sock


cd /home/ec2-user/app

echo "Stopping existing containers..."
WEBSITE_CONTAINERS=$(docker ps -q --filter "ancestor=websitev2:latest")
API_CONTAINERS=$(docker ps -q --filter "ancestor=api:latest")

if [ -n "$WEBSITE_CONTAINERS" ]; then
  docker stop $WEBSITE_CONTAINERS
else
  echo "No running websitev2 containers to stop."
fi

if [ -n "$API_CONTAINERS" ]; then
  docker stop $API_CONTAINERS
else
  echo "No running api containers to stop."
fi

echo "Removing existing containers..."
ALL_WEBSITE_CONTAINERS=$(docker ps -a -q --filter "ancestor=websitev2:latest")
ALL_API_CONTAINERS=$(docker ps -a -q --filter "ancestor=api:latest")

if [ -n "$ALL_WEBSITE_CONTAINERS" ]; then
  docker rm $ALL_WEBSITE_CONTAINERS
else
  echo "No stopped websitev2 containers to remove."
fi

if [ -n "$ALL_API_CONTAINERS" ]; then
  docker rm $ALL_API_CONTAINERS
else
  echo "No stopped api containers to remove."
fi

docker build -t websitev2:latest .

docker run -d -p 443:443 websitev2:latest

cd /home/ec2-user/app/api

docker build -t api:latest .

docker run -d -p 8000:8000 api:latest

echo "Checking running containers..."
docker ps

echo "Checking logs for websitev2 container..."
docker logs $(docker ps -q --filter "ancestor=websitev2:latest")
echo "Checking logs for api container..."
docker logs $(docker ps -q --filter "ancestor=api:latest")

echo "Checking images..."
docker images

echo "Checking network..."
docker network ls

echo "Deployment complete!"