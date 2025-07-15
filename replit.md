# Revelsy - Student Portal Application

## Overview

Revelsy is a full-stack student portal application built for Our Lady of Assumption College School (Grade 6). It's designed as a learning management system where students can submit assignments, participate in real-time chat, and track their academic progress. The application features a modern React frontend with a Node.js/Express backend, PostgreSQL database, and Replit authentication integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSockets for live chat functionality
- **File Handling**: Multer for assignment file uploads

### Database Design
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration Strategy**: Schema-first with automatic migrations via drizzle-kit
- **Database Provider**: Neon serverless PostgreSQL
- **Core Tables**:
  - `users` - User profiles and authentication data
  - `assignments` - Student assignment submissions
  - `chat_messages` - Real-time chat messages
  - `sessions` - Session storage for authentication

## Key Components

### Authentication System
- **Problem**: Secure student authentication in educational environment
- **Solution**: Replit OIDC integration with automatic user provisioning
- **Features**: Automatic session management, user profile creation, secure logout
- **Benefits**: Seamless integration with Replit's educational platform

### Assignment Management
- **Problem**: Students need to submit and track homework assignments
- **Solution**: File upload system with status tracking and teacher feedback
- **Features**: File uploads, due date tracking, grade management, subject categorization
- **Status Flow**: pending → submitted → graded

### Real-time Chat
- **Problem**: Students need to communicate and collaborate
- **Solution**: WebSocket-based chat with live updates
- **Features**: Real-time messaging, online user count, message history
- **Benefits**: Immediate feedback and peer interaction

### Dashboard & Analytics
- **Problem**: Students need overview of their academic progress
- **Solution**: Statistics dashboard with assignment metrics
- **Features**: Assignment completion rates, recent activity, quick navigation
- **Metrics**: Pending, completed, and graded assignment counts

## Data Flow

### Authentication Flow
1. User accesses application → Redirected to Replit OIDC
2. Successful authentication → User data stored/updated in database
3. Session created with PostgreSQL backing store
4. Frontend receives user data via `/api/auth/user` endpoint

### Assignment Submission Flow
1. Student fills assignment form with file upload
2. Multer processes file upload to local storage
3. Assignment data stored in database with file metadata
4. Real-time updates via React Query invalidation
5. Teacher can update status and grades

### Chat Message Flow
1. WebSocket connection established on chat page load
2. Messages sent via WebSocket protocol
3. Server broadcasts to all connected clients
4. Message history loaded from database on initial connection

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Build Tools**: Vite, TypeScript, ESBuild for production builds
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **Authentication**: Passport.js with OpenID Connect strategy
- **UI Components**: Radix UI primitives, Lucide React icons

### Development Dependencies
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Validation**: Zod for schema validation
- **Utilities**: Class Variance Authority, clsx for conditional classes
- **File Handling**: Multer for multipart form data

### Replit-Specific Integrations
- **Development**: Replit Vite plugins for error overlay and cartographer
- **Authentication**: Replit OIDC for secure student login
- **Deployment**: Optimized for Replit's hosting environment

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` - Runs development server with hot reload
- **Database**: Automatic schema push with `npm run db:push`
- **File Structure**: Client code in `/client`, server in `/server`, shared schemas in `/shared`

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static files served by Express in production
- **Command**: `npm run build` followed by `npm start`

### Database Management
- **Schema Changes**: Managed through Drizzle migrations in `/migrations`
- **Environment**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Security Considerations
- **Authentication**: OIDC with secure session management
- **File Uploads**: Size limits and type validation
- **Environment Variables**: Secure handling of secrets and database URLs
- **CORS**: Configured for Replit domain restrictions