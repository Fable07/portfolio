# Production image — the built site served by nginx.
#
# Two stages: stage 1 builds with Node, stage 2 keeps only the static files, so the
# shipped image has no Node, no node_modules and no source (a few MB instead of ~500).
#
#   docker build -t portfolio-frontend --build-arg VITE_API_URL=https://api.example.com/api .
#   docker run -p 8080:80 portfolio-frontend
#
# VITE_API_URL is baked in at BUILD time (Vite inlines it), so a different API URL
# means a rebuild — that is why it is a build arg and not a runtime env var.

# ── Stage 1: build ──
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests first: this layer is cached until the dependencies change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Stage 2: serve ──
FROM nginx:1.27-alpine AS production

# SPA routing + asset caching (see docker/nginx.conf)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine already has a sensible CMD; declared here for readability
CMD ["nginx", "-g", "daemon off;"]
