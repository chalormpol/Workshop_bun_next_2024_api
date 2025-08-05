FROM oven/bun:1.1.18-slim

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start"]
