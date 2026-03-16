FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build args (optional): VITE_API_URL for frontend, CADDYFILE for runtime config
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM caddy:2-alpine

ARG CADDYFILE=Caddyfile
# Copy selected Caddyfile (prod by default, dev overridable via build arg)
COPY ${CADDYFILE} /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv

EXPOSE 80
EXPOSE 443
