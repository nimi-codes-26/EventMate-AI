# Stage 1: Build the frontend
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:18-slim

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
