# Stage 1: Build
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js application with dummy env vars for build-time requirements
ENV POSTGRES_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV NEXTAUTH_SECRET=docker-build-secret-not-used-in-production
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key
ENV VERCEL_BLOB_TOKEN=dummy-token
ENV OPENAI_API_KEY=dummy-key

RUN pnpm build

# Stage 2: Production Runtime
FROM node:22-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder (standalone includes all dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 3000

# Health check: Give container 3 minutes to start Next.js server + Supabase client initialization
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
