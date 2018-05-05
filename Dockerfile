FROM node:9-alpine

EXPOSE 3000

ENV PORT=3000 \
    NODE_ENV=production

RUN addgroup -S web \
&&  adduser -S -g web web \
&&  mkdir /app \
&&  chown -R web:web /app

WORKDIR /app

COPY . .

RUN npm i

ENTRYPOINT ["npm"]
CMD ["start"]
