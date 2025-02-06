FROM nginx:latest


COPY /websitev2/browser/ /usr/share/nginx/html

COPY /docker/default.conf /etc/nginx/conf.d/default.conf

COPY /docker/fullchain.pem /etc/ssl/certs/fullchain.pem

COPY /docker/privkey.pem /etc/ssl/private/privkey.pem

RUN chown 101:101 /etc/ssl/private/privkey.pem /etc/ssl/certs/fullchain.pem && \
    chmod 600 /etc/ssl/private/privkey.pem && \
    chmod 644 /etc/ssl/certs/fullchain.pem

EXPOSE 80
EXPOSE 443

