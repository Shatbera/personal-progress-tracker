FROM node:20-alpine
WORKDIR /app
COPY apps/api/package.json apps/api/yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY apps/api/ .
RUN yarn build
EXPOSE 3001
CMD ["node", "dist/main"]

