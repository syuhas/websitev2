#!/bin/bash

sudo dnf update -y
sudo dnf install -y git
sudo dnf install -y nodejs
sudo dnf install -y @angular/cli
sudo dnf install -y nginx


cd /tmp
npm install
ng build --configuration production

sudo mkdir -p /var/www/html

sudo cp -r /tmp/dist/websitev2/browser/* /var/www/html

sudo cp /tmp/deploy/nginx.conf /etc/nginx/nginx.conf

sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx