FROM docker.io/library/node:lts-bullseye AS base
WORKDIR /app
EXPOSE 7995

FROM base AS install-deps
WORKDIR /src
RUN sh -c 'npm update -g' > /dev/null
COPY ./package.json ./pnpm* ./
RUN sh -c 'corepack use pnpm && pnpm install' > /dev/null

FROM install-deps AS build
COPY . .
RUN sh -c 'pnpm run build' > /dev/null

FROM docker.io/joseluisq/static-web-server:2-debian AS runtime
WORKDIR /app
COPY --from=build /src/dist .

FROM runtime AS final
ENTRYPOINT [ "static-web-server", "--port", "7995", "--root", "." ]
