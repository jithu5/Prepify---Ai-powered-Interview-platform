# Stage 1 - Build
FROM node:slim
WORKDIR /app
# Copy package files separately for caching
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install
# Run Prisma generate to generate the Prisma client
COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]