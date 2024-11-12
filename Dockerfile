FROM node:lts-alpine as build

WORKDIR /app

COPY package.json ./

RUN npm install -g @angular/cli

RUN npm install

COPY . .

RUN ng build --configuration production

FROM nginx:latest
COPY --from=build /app/dist/websitev2/browser /usr/share/nginx/html

EXPOSE 80

