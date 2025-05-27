# ---------- Stage 1: Build ----------
FROM node:20-slim AS builder

# Install OpenSSL and required dev libraries
RUN apt-get update && apt-get install -y openssl libssl-dev

# Set working directory
WORKDIR /app

# Copy package files and prisma
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate


# ---------- Stage 2: Runtime ----------
FROM node:23-alpine

# Install production dependencies only (optional if pre-bundled)
# RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app /app
EXPOSE 3000

# If you're only running in dev mode, use:
CMD ["npm", "run", "dev"]

# For production mode:
# RUN npm ci --omit=dev
# RUN npm run build
# CMD ["npm", "start"]
