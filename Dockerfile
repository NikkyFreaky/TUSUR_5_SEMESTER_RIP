# Строим сервер
FROM node:latest AS server-builder

WORKDIR /usr/src/app/server

COPY ./server/package*.json ./

RUN apt-get update && apt-get install -y build-essential python3

RUN npm install -g node-gyp
RUN npm install

COPY ./server .

RUN npm rebuild bcrypt --build-from-source

CMD ["sh", "-c", "sleep 40 && node app.js"]


# Строим клиент
FROM node:latest AS client-builder

WORKDIR /usr/src/app/client

COPY ./client/package*.json ./

RUN npm install

COPY ./client .

CMD ["npm", "run", "start"]