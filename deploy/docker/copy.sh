#!/bin/bash

set -x

INSTANCE_PUBLIC_DNS="${PUBLIC_DNS}"
REMOTE_USER="${USER}"

if [ -z "$INSTANCE_PUBLIC_DNS" ]; then
    echo "Could not find DNS or user for SSH connection"
    exit 1
fi

echo "Remote user: {$REMOTE_USER}"
echo "Instance DNS: {$INSTANCE_PUBLIC_DNS}"

echo "Current Directory:"
pwd
echo "Listing files:"
ls -l

echo "Copying project files to remote server..."
scp -o StrictHostKeyChecking=no -r ./dist "$REMOTE_USER@$INSTANCE_PUBLIC_DNS:/home/ec2-user/app"
scp -o StrictHostKeyChecking=no -r ./deploy/docker "$REMOTE_USER@$INSTANCE_PUBLIC_DNS:/home/ec2-user/app"
scp -o StrictHostKeyChecking=no Dockerfile "$REMOTE_USER@$INSTANCE_PUBLIC_DNS:/home/ec2-user/app"
scp -o StrictHostKeyChecking=no -r ./api "$REMOTE_USER@$INSTANCE_PUBLIC_DNS:/home/ec2-user/app/api"

echo "Connecting to remote server via SSH..."

ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$INSTANCE_PUBLIC_DNS" << 'EOF'
    chmod +x /home/ec2-user/app/docker/deploy.sh
    /home/ec2-user/app/docker/deploy.sh
EOF


echo "Deployment complete!"