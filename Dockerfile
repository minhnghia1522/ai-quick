# Sử dụng Node.js 18 làm base image
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có)
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng Next.js
RUN npm run build

# Tạo một image mới chỉ để chạy ứng dụng
FROM node:18-alpine AS runner

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép thư mục build từ image trước
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Thiết lập biến môi trường cho Next.js
ENV NODE_ENV production

# Expose cổng mà ứng dụng chạy
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]


# CMD
# docker build -t translator-ai-webapp .
# docker rm -f translator-ai-webapp
# docker run --name translator-ai-webapp -d --restart always -p 3008:3000 translator-ai-webapp