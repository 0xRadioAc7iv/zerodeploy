# Base image
FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm run build

EXPOSE 5000

CMD ["pnpm", "start"]
