# ใช้ base image ที่มี Bun และ OpenSSL 3
# เราจะใช้ official Bun image ซึ่ง built บน Ubuntu 22.04 ที่มี OpenSSL 3 อยู่แล้ว
FROM oven/bun:1.1.18-slim

# ตั้งค่า working directory ใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และ bun.lockb เพื่อติดตั้ง dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# คัดลอกโค้ดทั้งหมดในโปรเจกต์
COPY . .

# สั่งให้ Prisma generate
RUN bunx prisma generate

# กำหนดพอร์ต
EXPOSE 3000

# คำสั่งสำหรับเริ่มแอปพลิเคชัน
CMD ["bun", "run", "start"]