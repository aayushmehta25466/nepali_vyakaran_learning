# Build stage - Install dependencies and build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install for flexibility with lock file mismatches)
RUN npm install --legacy-peer-deps && npm install react-is

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - Serve with Node + Express (or nginx if preferred)
FROM node:18-alpine

WORKDIR /app

# Install serve package to serve the static build
RUN npm install -g serve

# Copy built app from builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
