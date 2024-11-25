# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster


WORKDIR /app

COPY . .

RUN pip3 install -e .



COPY . .





CMD ["runserver"]

EXPOSE 8000