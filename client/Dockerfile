#  build stage
# FROM node:22-alpine as build-stage
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY ./ ./
# RUN npm run build

# # production stage
# FROM nginx:stable-alpine as production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:22-alpine

WORKDIR /app/src

COPY package*.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "run", "dev"]