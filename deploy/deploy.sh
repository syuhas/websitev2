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

# sudo sed -i 's|server_name  tmp;.*|server_name  '"$INSTANCE_PUBLIC_DNS"';|' ./deploy/nginx.conf
# sudo chmod +x -R ./*
echo "Copying project files to remote server..."
scp -o StrictHostKeyChecking=no -r ./ "$REMOTE_USER@$INSTANCE_PUBLIC_DNS:/tmp"

echo "Connecting to remote server via SSH..."

ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$INSTANCE_PUBLIC_DNS" << 'EOF'
    chmod +x /tmp/deploy/build.sh
    /tmp/deploy/build.sh
EOF


echo "Deployment complete!"
    

