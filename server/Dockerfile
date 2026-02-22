# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

# Start server
CMD ["node", "dist/index.js"]