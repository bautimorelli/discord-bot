FROM node:12-alpine

RUN apk add --no-cache \
  udev \
  ttf-freefont \
  chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

WORKDIR /app

COPY package.json /app/
COPY app /app/app
COPY index.js /app/index.js

RUN npm install

VOLUME ["/app/storage", "/app/updates"]

RUN echo $TZ > /etc/timezone

CMD node .
