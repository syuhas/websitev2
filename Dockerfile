# FROM node:18.13.0 as build

# WORKDIR /app

# COPY package.json ./

# RUN npm install -g @angular/cli --prefer-offline --no-audit

# RUN npm install --prefer-offline --no-audit

# COPY . .

# RUN ng build --configuration production

FROM nginx:latest
COPY /dist/websitev2/browser/ /usr/share/nginx/html
COPY /deploy/default.conf /etc/nginx/conf.d/default.conf

COPY /deploy/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY /deploy/privkey.pem /etc/ssl/private/privkey.pem

RUN chown 101:101 /etc/ssl/private/privkey.pem /etc/ssl/certs/fullchain.pem && \
    chmod 600 /etc/ssl/private/privkey.pem && \
    chmod 644 /etc/ssl/certs/fullchain.pem

EXPOSE 80
EXPOSE 443

