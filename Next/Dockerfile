# Use slim Debian-based Node.js image
FROM node:lts-slim

# Set working directory
WORKDIR /app

# Copy package files separately for caching
COPY package.json package-lock.json ./
# RUN npm ci

# Install Node.js dependencies
RUN npm install

# Run Prisma generate to generate the Prisma client
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Run the development server
CMD ["npm", "run", "dev"]