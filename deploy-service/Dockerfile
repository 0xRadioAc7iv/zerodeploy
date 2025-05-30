# Base image
FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm run build

COPY .env .env

EXPOSE 4000

CMD ["pnpm", "start"]
