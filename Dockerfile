# Строим сервер
FROM node:latest AS server-builder

WORKDIR /usr/src/app/server

COPY ./server/package*.json ./

RUN apt-get update && apt-get install -y build-essential python3

RUN npm install -g node-gyp
RUN npm install

COPY ./server .

RUN npm rebuild bcrypt --build-from-source

CMD ["node", "app.js"]


# Строим клиент
FROM node:latest AS client-builder

WORKDIR /usr/src/app/client

COPY ./client/package*.json ./

RUN npm install

COPY ./client .

CMD ["npm", "run", "start"]


FROM mysql:8.1.0

ENV MYSQL_DATABASE=rip_db

ENV MYSQL_ROOT_PASSWORD=02122004
