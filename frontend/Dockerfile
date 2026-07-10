# Build Stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
RUN npm ci
COPY shared/ ./shared/
COPY frontend/ ./frontend/
RUN npm run build -w shared
RUN npm run build -w frontend

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
