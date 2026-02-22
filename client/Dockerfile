# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
 && find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]