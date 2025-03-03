#!/bin/sh

npm run build

addgroup -g 1001 -S nodejs
adduser -S nextjs -u 1001

USER nextjs

npm start
