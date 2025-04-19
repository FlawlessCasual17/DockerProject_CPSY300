FROM docker.io/joseluisq/static-web-server:2-debian AS base
WORKDIR /app
EXPOSE 7995

FROM docker.io/library/node:lts-bullseye AS install-deps
WORKDIR /src
RUN sh -c 'npm update -g && corepack use pnpm' > /dev/null
COPY ./package.json ./pnpm* ./
RUN sh -c 'pnpm install' > /dev/null

FROM install-deps AS build
COPY . .
RUN sh -c 'pnpm run build' > /dev/null

FROM base AS final
WORKDIR /app
COPY --from=build /src/dist .
ENTRYPOINT [ "static-web-server", "--port", "7995", "--root", "." ]
