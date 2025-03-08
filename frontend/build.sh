#!/bin/sh

npm run build

node .next/standalone/server.js
rm -rf node_modules
