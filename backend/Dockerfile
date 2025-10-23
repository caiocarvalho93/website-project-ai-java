# Railway Dockerfile for CIA Intelligence Network
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Change to backend directory and install dependencies
WORKDIR /app/unemployment-api
RUN npm install

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]