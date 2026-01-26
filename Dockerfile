# Build stage
FROM node:18-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept the API URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=https://osamoc-backend-963434310193.us-central1.run.app


RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a basic nginx config to handle SPA routing if needed
# For now, standard nginx setup
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
