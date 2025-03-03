FROM node:18-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat curl iproute2 iputils wget bind-tools  net-tools,
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN chmod +x ./entrypoint.sh

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

ENTRYPOINT ["./entrypoint.sh"]


FROM base as local
ENV NODE_ENV=local
RUN npm install
COPY . .
CMD npm run local
