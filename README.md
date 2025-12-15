# 🎵 Music Player

**ES234632 - Pengembangan Sistem dan Operasi**

A full-stack web-based music streaming application with playlist management, secure authentication, and cloud-based storage.

## 👥 Group 8

- Satria Pinandita (5026231004)
- Kevin Nathanael (5026231079)
- Muhammad Razan Parisya Putra (5026231174)

## ✨ Features

- Stream MP3 audio files with embedded metadata
- Create and manage custom playlists
- Search and filter songs by title, artist, or album
- User authentication via GitHub OAuth or email/password
- Mark favorite tracks for quick access
- Dark/light theme support
- Responsive design for desktop and mobile
- Real-time search functionality

## 🛠️ Tech Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, ShadCN/UI  
**Backend**: Next.js API Routes, NextAuth.js  
**Database**: PostgreSQL (Supabase), Drizzle ORM  
**Storage**: Vercel Blob  
**Testing**: Jest, React Testing Library  
**Code Quality**: ESLint, Prettier  
**Deployment**: Vercel, AWS ECS with ALB  
**CI/CD**: GitHub Actions

## 🏗️ Technical Architecture

### Technology Stack

| Component                | Technology                    | Version | Purpose                                      |
| ------------------------ | ----------------------------- | ------- | -------------------------------------------- |
| **Runtime**              | Node.js                       | 18+     | JavaScript runtime environment               |
| **Package Manager**      | pnpm                          | 8+      | Fast and efficient package management        |
| **Frontend Framework**   | Next.js                       | 14      | React meta-framework with SSR and API routes |
| **Language**             | TypeScript                    | Latest  | Type-safe application development            |
| **UI Library**           | React                         | 18+     | Component-based UI framework                 |
| **Styling**              | Tailwind CSS                  | Latest  | Utility-first CSS framework                  |
| **UI Components**        | ShadCN/UI                     | Latest  | Accessible component library                 |
| **State Management**     | React Query                   | Latest  | Server state management and caching          |
| **Backend**              | Next.js API Routes            | 14      | Serverless backend functions                 |
| **Authentication**       | NextAuth.js                   | Latest  | Complete authentication solution             |
| **ORM**                  | Drizzle ORM                   | Latest  | Type-safe database access                    |
| **Database**             | PostgreSQL                    | Latest  | Relational database                          |
| **Database Hosting**     | Supabase                      | -       | PostgreSQL hosting and management            |
| **Cloud Storage**        | Vercel Blob                   | -       | Serverless blob storage                      |
| **Testing Framework**    | Jest                          | 30+     | Unit testing framework                       |
| **Component Testing**    | React Testing Library         | Latest  | Testing utilities for React components       |
| **Code Linting**         | ESLint                        | Latest  | Code quality and style enforcement           |
| **Code Formatting**      | Prettier                      | Latest  | Automatic code formatting                    |
| **Git Hooks**            | Husky                         | Latest  | Pre-commit and pre-push hooks                |
| **CI/CD Platform**       | GitHub Actions                | -       | Automated workflows and deployments          |
| **Deployment Platforms** | Vercel, AWS ECS               | -       | Application hosting                          |
| **Load Balancing**       | AWS Application Load Balancer | -       | Traffic distribution                         |
| **Container Registry**   | AWS ECR                       | -       | Docker image management                      |

### System Architecture

The application follows a client-server architecture with the following layers:

1. **Presentation Layer**: Next.js frontend with React components and Tailwind CSS styling
2. **API Layer**: Next.js API routes providing RESTful endpoints
3. **Business Logic Layer**: Service functions handling authentication, audio processing, and playlist management
4. **Data Access Layer**: Drizzle ORM providing type-safe database queries
5. **Storage Layer**: PostgreSQL for structured data, Vercel Blob for unstructured media files

## 📦 Installation and Setup

### System Requirements

- Node.js version 18.0.0 or higher
- pnpm version 8.0.0 or higher
- Git version control system
- PostgreSQL database access (via Supabase)
- Vercel account with Blob storage access
- GitHub account with OAuth application credentials

### Installation Procedure

#### Step 1: Repository Cloning

```bash
git clone https://github.com/mhmdrazn/FP-PSO25.git
cd Music-Player
```

#### Step 2: Dependency Installation

```bash
pnpm install
```

This command installs all project dependencies as specified in `package.json` and `pnpm-lock.yaml`.

#### Step 3: Environment Configuration

Create a `.env.local` file in the project root directory with the following configuration:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-using-openssl-rand-base64-32>

# GitHub OAuth Configuration
# Obtain these credentials from GitHub Settings > Developer settings > OAuth Apps
GITHUB_ID=<your-github-oauth-client-id>
GITHUB_SECRET=<your-github-oauth-client-secret>

# Database Configuration
# Connection string from Supabase project settings
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Vercel Blob Storage Configuration
# Token from Vercel project settings
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
```

#### Step 4: Database Initialization

```bash
# Execute database migrations to create schema
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

The seed script performs the following operations:

1. Reads MP3 files from the `tracks/` directory
2. Extracts metadata (artist, title, album, duration) from MP3 tags
3. Extracts and uploads cover images to Vercel Blob
4. Uploads audio files to Vercel Blob cloud storage
5. Inserts song records into PostgreSQL database
6. Creates default playlist collections

#### Step 5: Development Server Initialization

```bash
pnpm dev
```

The development server will start on `http://localhost:3000`. The application supports hot module replacement for rapid development iteration.

## 🎧 Audio File Management

### Supported Audio Format

- **Format**: MP3 (MPEG-3 Audio)
- **Bitrate**: 128 kbps minimum (192 kbps recommended)
- **Encoding**: Metadata must be embedded in ID3v2 format
- **Required Metadata Fields**:
  - Title (track name)
  - Artist (performer name)
  - Album (album/collection name)
  - Duration (automatically extracted)
  - Cover Image (optional but recommended)

### Audio File Acquisition

#### Method 1: YouTube Playlist Download

Use `yt-dlp` utility to download audio from YouTube playlists with embedded metadata:

```bash
yt-dlp -x --audio-format mp3 --add-metadata --embed-thumbnail \
  "https://www.youtube.com/playlist?list=<PLAYLIST_ID>"
```

Command Parameters:

- `-x` or `--extract-audio`: Extract audio from video files
- `--audio-format mp3`: Convert to MP3 format
- `--add-metadata`: Add metadata from YouTube (title, artist, album)
- `--embed-thumbnail`: Embed cover image in MP3 file
- Output directory: `tracks/` (automatically organized)

#### Method 2: Manual File Addition

1. Ensure audio files are in MP3 format with embedded metadata
2. Place files in the project `tracks/` directory
3. Files should follow naming convention: `Artist - Title.mp3`
4. Run seed script to process and upload

### Audio Processing Pipeline

Upon execution of `pnpm db:seed`, the following automated pipeline processes audio files:

```
Local MP3 File
    ↓
Metadata Extraction (using music-metadata library)
    ├─ Extract: Title, Artist, Album, Duration
    ├─ Extract: Cover Image (if embedded)
    └─ Extract: Audio Properties
    ↓
Upload to Vercel Blob
    ├─ Audio File → storage://audio/filename.mp3
    └─ Cover Image → storage://album_covers/filename.png
    ↓
Database Insertion
    └─ Create Song Record with References to Blob URLs
    ↓
Playlist Association
    └─ Distribute Songs to Associated Playlists
```

### Seed Script Functionality

The `lib/db/seed.ts` script provides comprehensive audio management:

1. **Metadata Extraction**: Parses MP3 files for embedded tags
2. **Cover Art Processing**: Extracts and uploads album artwork
3. **Cloud Upload**: Transfers files to Vercel Blob storage
4. **Database Population**: Inserts metadata and storage references
5. **Playlist Creation**: Organizes songs into themed collections
6. **Error Handling**: Gracefully handles missing metadata or upload failures

## 🔐 Authentication System

### OAuth 2.0 Implementation

#### GitHub OAuth Configuration

To configure GitHub OAuth authentication:

1. Navigate to GitHub Settings: `Settings > Developer settings > OAuth Apps`
2. Click `New OAuth App` button
3. Configure OAuth Application:
   - **Application Name**: Music Player
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
   - **Authorization Callback URL**: `https://yourdomain.com/api/auth/callback/github`
4. GitHub will provide Client ID and Client Secret
5. Add credentials to `.env.local`:
   ```env
   GITHUB_ID=<your-client-id>
   GITHUB_SECRET=<your-client-secret>
   ```

#### OAuth 2.0 Flow

The authentication flow follows standard OAuth 2.0 authorization code grant:

```
User
  ↓
Click "Sign in with GitHub"
  ↓
Redirect to GitHub Authorization
  ↓
User Grants Permission
  ↓
GitHub Redirects to /api/auth/callback/github with Authorization Code
  ↓
NextAuth.js Exchanges Code for Access Token
  ↓
NextAuth.js Retrieves User Profile from GitHub API
  ↓
Application Creates or Updates User Record
  ↓
JWT Session Token Generated
  ↓
Redirect to Application with Session
```

### Email/Password Authentication

#### User Registration

Users can register using email and password:

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "User Name"
}
```

Response:

- Success: HTTP 201 with user object
- Failure: HTTP 400 with error details

Password Security:

- Passwords hashed using bcrypt with salt rounds: 10
- Original passwords never stored in database
- Passwords transmitted over HTTPS only

#### User Login

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Session Management

The application uses JWT (JSON Web Token) based sessions:

- **Session Strategy**: JWT tokens (stateless)
- **Token Expiration**: Configurable (default: 30 days)
- **Refresh Mechanism**: Automatic token refresh on activity
- **Storage**: Secure HTTP-only cookies
- **CSRF Protection**: Enabled by default in NextAuth.js

## 👨‍💻 Development Workflow

### Project Structure

```
Music-Player/
├── app/                           # Next.js App Router
│   ├── api/
│   │   ├── auth/                 # Authentication routes
│   │   │   ├── [...nextauth]/    # NextAuth.js handler
│   │   │   ├── register/         # User registration
│   │   │   └── callback/         # OAuth callbacks
│   │   ├── audio/
│   │   │   └── [filename]/       # Audio streaming endpoint
│   │   ├── favorites/            # Favorite management
│   │   └── revalidate/           # Cache invalidation
│   ├── p/                         # Playlist routes
│   │   └── [id]/                 # Playlist detail page
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page (all tracks)
│   ├── search.tsx                # Search component
│   ├── playback-context.tsx      # Audio playback state
│   ├── playback-controls.tsx     # Player UI controls
│   ├── now-playing.tsx           # Now playing display
│   └── optimistic-playlists.tsx  # Playlist management
├── components/                    # Reusable components
│   ├── ui/                       # ShadCN/UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── scroll-area.tsx
│   ├── auth-wall.tsx             # Authentication wrapper
│   ├── user-button.tsx           # User profile menu
│   ├── theme-provider.tsx        # Dark mode provider
│   └── theme-toggle.tsx          # Theme switcher
├── lib/                           # Utilities and configuration
│   ├── auth.ts                   # NextAuth configuration
│   ├── db/
│   │   ├── drizzle.ts            # Database client
│   │   ├── schema.ts             # Database schema definitions
│   │   ├── queries.ts            # Database queries
│   │   ├── seed.ts               # Seed script
│   │   ├── migrations/           # Migration files
│   │   └── types.ts              # Type definitions
│   ├── helpers.ts                # Utility functions
│   ├── string-utils.ts           # String manipulation utilities
│   ├── number-utils.ts           # Number formatting utilities
│   └── utils.tsx                 # React utilities
├── __tests__/                     # Test files
│   ├── utils.test.ts             # 10 unit tests
│   ├── string-utils.test.ts      # 22 unit tests
│   └── number-utils.test.ts      # 4 unit tests
├── public/                        # Static assets
├── tracks/                        # Audio files (git ignored)
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── jest.config.cjs                # Jest configuration
└── drizzle.config.ts              # Drizzle ORM configuration
```

### Command Reference

#### Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Build optimized production bundle
pnpm build

# Start production server
pnpm start

# Run Next.js development server analysis
pnpm dev -- --debug
```

#### Testing Commands

```bash
# Execute entire test suite
pnpm test

# Run tests in watch mode for continuous feedback
pnpm test:watch

# Generate code coverage report
pnpm test:coverage

# Run specific test file
pnpm test -- <filename>
```

#### Code Quality Commands

```bash
# Run ESLint on all source files
pnpm lint

# Check code formatting with Prettier
pnpm format:check

# Format all source files with Prettier
pnpm format

# Run all quality checks
pnpm lint && pnpm format:check && pnpm test:coverage
```

#### Database Commands

```bash
# Generate and execute database migrations
pnpm db:migrate

# Seed database with initial data
pnpm db:seed

# Open Drizzle Studio for visual database management
pnpm db:studio

# Setup environment configuration
pnpm db:setup

# Validate database schema
pnpm db:validate
```

## 🧪 Testing Strategy

### Test Coverage

The application maintains comprehensive test coverage using Jest and React Testing Library:

- **Total Tests**: 36 test cases
- **Test Coverage**: 100% on utility functions
- **Passing Tests**: 36/36 (100%)
- **Test Execution Time**: ~1.5 seconds

### Test Organization

#### Utility Function Tests (`__tests__/utils.test.ts`)

Tests core utility functions used throughout the application:

- 10 test cases covering helper functions
- Tests for className merging and duration formatting
- Edge cases and error conditions

#### String Utility Tests (`__tests__/string-utils.test.ts`)

Tests string manipulation and validation functions:

- 22 test cases for string operations
- Email validation tests
- String truncation and slug generation
- Character case conversion

#### Number Utility Tests (`__tests__/number-utils.test.ts`)

Tests numeric operations and formatting:

- 4 test cases for numeric functions
- Byte formatting (KB, MB, GB conversion)
- Number clamping and random generation
- Relative time formatting

### Running Tests

```bash
# Execute full test suite
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test utils.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="formatBytes"
```

## 🚀 Continuous Integration and Deployment

### CI/CD Pipeline Overview

The application implements automated continuous integration and deployment using GitHub Actions. The pipeline ensures code quality, security, and reliable deployment across environments.

### GitHub Actions Workflows

#### Continuous Integration Workflow (`.github/workflows/ci.yml`)

The CI pipeline executes on each push and pull request:

1. **Code Checkout**: Clone repository at specific commit
2. **Environment Setup**: Install Node.js and pnpm
3. **Dependency Installation**: Install all project dependencies
4. **ESLint Code Analysis**: Check code quality and style
5. **Prettier Format Check**: Verify code formatting consistency
6. **Jest Test Execution**: Run complete test suite
7. **Build Verification**: Compile Next.js application
8. **Deploy Staging** (on main): Deploy to staging environment
9. **Deploy Production** (on main): Deploy to production

### Code Quality Checks

#### ESLint Configuration

- Enforces code style and best practices
- Detects potential errors and anti-patterns
- Configuration: `.eslintrc.cjs`
- Scope: All JavaScript and TypeScript files

#### Prettier Formatting

- Ensures consistent code formatting across codebase
- Configuration: Built-in Next.js defaults
- Auto-formats on pre-commit (via Husky)

#### Pre-commit Hooks (Husky)

Automated checks before committing code:

```bash
# Installed via pnpm prepare
pnpm prepare
```

Hooks execute:

1. Lint staged files with ESLint
2. Format staged files with Prettier
3. Run test suite
4. Validate commit message format

### Deployment Environments

#### Vercel Production Deployment

Vercel hosts the primary production environment:

**Features**:

- Automatic deployment on `main` branch push
- Edge Functions for serverless compute
- Blob Storage for media files
- Automatic HTTPS with SSL certificates
- CDN distribution globally
- Automatic preview deployments for PRs

**Configuration**: `vercel.json` settings

#### AWS ECS Production Deployment

AWS ECS provides containerized deployment option:

**Architecture**:

- Docker container image built from `Dockerfile`
- Image stored in AWS ECR (Elastic Container Registry)
- ECS Fargate for serverless container execution
- Application Load Balancer (ALB) for traffic distribution
- Auto-scaling based on CPU/memory metrics

**Deployment Steps**:

```bash
# Build Docker image
docker build -t music-player:latest .

# Tag image for ECR
docker tag music-player:latest $ECR_URI/music-player:latest

# Push to ECR
docker push $ECR_URI/music-player:latest

# Update ECS service
aws ecs update-service --cluster prod --service music-player \
  --force-new-deployment
```

## 🛡️ Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with NEXTAUTH_SECRET
- HTTP-only cookies prevent XSS attacks
- CSRF protection enabled by default
- Session expiration after inactivity

### Data Security

- All communications over HTTPS/TLS
- Database credentials managed via environment variables
- Sensitive secrets never committed to version control
- SQL injection prevention via parameterized queries (Drizzle ORM)

### API Security

- Authentication required for protected endpoints
- Rate limiting on auth endpoints (recommended)
- CORS configuration for cross-origin requests
- Content Security Policy headers

## ⚡ Performance Optimization

### Frontend Optimization

- Code splitting via Next.js automatic bundling
- Image optimization with next/image component
- Client-side caching with React Query
- Optimistic UI updates for perceived performance

### Backend Optimization

- Database connection pooling (via Supabase)
- Query optimization with Drizzle ORM
- API response caching with appropriate headers
- Compression of API responses (gzip)

### Deployment Optimization

- Edge deployment on Vercel for reduced latency
- Container optimization for AWS ECS
- CDN distribution of static assets
- Database index optimization on frequently queried columns

## 🐛 Troubleshooting Guide

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:

1. Verify `DATABASE_URL` in `.env.local` is correct
2. Check Supabase project is active
3. Verify IP whitelist allows your connection
4. Test connection: `pnpm db:validate`

### Authentication Failures

**Problem**: `OAuth redirect_uri mismatch` error

**Solution**:

1. Verify callback URL in GitHub OAuth settings matches deployment URL
2. Ensure `NEXTAUTH_URL` environment variable is set correctly
3. For AWS ALB, configure proper domain and HTTPS
4. Clear browser cookies and session cache

### Audio Upload Failures

**Problem**: Files not appearing after seed

**Solution**:

1. Verify Vercel Blob token is valid and has sufficient quota
2. Check MP3 files have proper metadata (use `ffprobe` to inspect)
3. Review seed script logs for specific errors
4. Ensure `tracks/` folder contains MP3 files

### Build Failures

**Problem**: `Module not found` or TypeScript errors

**Solution**:

1. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
2. Regenerate lockfile: `pnpm install --no-frozen-lockfile`
3. Check TypeScript errors: `pnpm tsc --noEmit`
4. Verify all environment variables are set

## Project Status and Changelog

**Current Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: December 15, 2025

### Version History

- **v1.0.0** (December 2025): Initial release
  - Full-stack music streaming application
  - OAuth 2.0 authentication
  - Multi-cloud deployment
  - Comprehensive test coverage

## Contact and Support

For questions or issues regarding this project:

- Create GitHub Issue: [Issues](https://github.com/mhmdrazn/FP-PSO25/issues)
- Contact Course Instructor: [Institution Contact]

---

**Disclaimer**: This project is created as a final assignment for ES234632 course. All external libraries and tools are used in accordance with their respective licenses.
