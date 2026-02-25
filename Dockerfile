# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000
# Database will be stored in the /app/data volume
ENV DATABASE_URL=/app/data/sqlite.db
ENV SESSION_DIR=/app/data

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Create a volume directory for databases
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
