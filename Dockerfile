FROM oven/bun:1.1.18-slim

WORKDIR /app

# คัดลอกไฟล์ทั้งหมดก่อน (รวม schema.prisma)
COPY app ./

# ติดตั้ง dependencies
RUN bun install --frozen-lockfile

# รัน prisma generate (อีกครั้ง เพื่อชัวร์)
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start"]
