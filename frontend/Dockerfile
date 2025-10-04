# Simple single-stage build for debugging
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_LINT=false
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application without standalone mode for now
RUN npm run build:docker

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
