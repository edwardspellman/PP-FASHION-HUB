# ==========================================
# STAGE 1: Build Frontend (Vite + React 19)
# ==========================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==========================================
# STAGE 2: Production Server (Node 22 + SQLite)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1 into client/dist for Express static serving
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure persistent directories exist
RUN mkdir -p /app/server/data /app/server/uploads

# Volumes for persistent SQLite database and uploaded images
VOLUME ["/app/server/data", "/app/server/uploads"]

EXPOSE 5000

CMD ["node", "server/server.js"]
