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

docker stop $(docker ps -q --filter "ancestor=websitev2:latest")
docker stop $(docker ps -q --filter "ancestor=api:latest")

docker rm $(docker ps -a -q --filter "ancestor=websitev2:latest")
docker rm $(docker ps -a -q --filter "ancestor=api:latest")

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