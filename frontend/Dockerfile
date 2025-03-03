FROM node:18-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat curl iproute2 iputils wget bind-tools  net-tools
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base as builder
WORKDIR /app
RUN npm install
COPY . .
RUN npm run build


FROM base as prod
WORKDIR /app

ENV NODE_ENV=prod
RUN npm ci

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD npm start

FROM base as local
ENV NODE_ENV=local
RUN npm install
COPY . .
CMD npm run local
