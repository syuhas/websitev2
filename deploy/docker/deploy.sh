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

# clean up any existing containers
for container in $(docker ps -a -q); do
    echo "Stopping and removing container: $container"
    docker stop $container
    docker rm $container
done

# add a Docker network if it doesn't already exist
NETWORK_NAME="my_network"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    echo "Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
else
    echo "Docker network $NETWORK_NAME already exists."
fi


# build and run website container
docker build -t websitev2:latest .

docker run -d --network $NETWORK_NAME --name website-service -p 443:443 websitev2:latest

cd /home/ec2-user/app/api


# # build and run api container
# docker build -t api:latest .

# docker run -d --network $NETWORK_NAME --name api-service -p 8000:8000 api:latest

# cd /home/ec2-user



# check the status of the deployment
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