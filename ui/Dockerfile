# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
# Inject VITE_API_URL and VITE_STANDALONE_DOMAIN during build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_STANDALONE_DOMAIN
ENV VITE_STANDALONE_DOMAIN=$VITE_STANDALONE_DOMAIN
# Force rebuild
RUN npm run build

# Stage 2: Serve the Static Content via Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

