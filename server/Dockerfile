FROM node:22-alpine

WORKDIR /app/src

RUN npm install -g nodemon

COPY package.json ./

RUN npm install

COPY ./ ./

RUN chmod -R 755 ./uploads

CMD ["nodemon", "./bin/www"]