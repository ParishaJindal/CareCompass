# Multi-stage lightweight production container for Google Cloud Run
FROM node:24-alpine

WORKDIR /app

# Copy application files, frontend assets, and SQLite database
COPY . .

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run defaults to port 8080
EXPOSE 8080

CMD ["node", "api/server.js"]

