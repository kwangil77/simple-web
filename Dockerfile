FROM harbor.example.io/docker.io/library/node:20-bookworm AS builder
LABEL maintainer="Kwangil Ha <kwangil77@hotmail.com>"
ENV NEXT_TELEMETRY_DISABLED="1"
WORKDIR /src
COPY . .
RUN cp .env.example .env \
    && npm install --no-progress --no-color \
    && npm run openapi:download \
    && npm run proto:download \
    && npm run graphql:download \
    && npm run openapi:generate \
    && npm run proto:generate \
    && npm run graphql:generate \
    && npm run build

FROM harbor.example.io/docker.io/library/node:20-bookworm AS nodejs
LABEL maintainer="Kwangil Ha <kwangil77@hotmail.com>"
WORKDIR /src
COPY --from=builder /src/package.json /src/package-lock.json ./
RUN npm install --only=prod

FROM harbor.example.io/docker.io/library/node:20-bookworm-slim
LABEL maintainer="Kwangil Ha <kwangil77@hotmail.com>"
ENV NEXT_TELEMETRY_DISABLED="1"
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"
WORKDIR /src
COPY --from=builder /src/public ./public
COPY --from=builder /src/.next/standalone ./
COPY --from=builder /src/.next/static ./.next/static
COPY --from=builder /src/index.js .
COPY --from=nodejs /src/package.json .
COPY --from=nodejs /src/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
