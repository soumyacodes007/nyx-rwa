FROM node:24-alpine

WORKDIR /app
COPY . .
RUN mkdir -p /data

ENV NODE_ENV=production

