FROM node:18-alpine AS base
RUN apk add --no-cache g++ make py3-pip libc6-compat curl iproute2 iputils wget bind-tools  net-tools
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN chmod +x ./build.sh

CMD ["./build.sh"]


FROM base AS local
ENV NODE_ENV=local
RUN npm install
COPY . .
CMD npm run local
