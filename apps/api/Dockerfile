FROM node:20-alpine AS base

# Backend Dockerfile
FROM base AS backend-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

FROM base AS backend-production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/uploads ./uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
