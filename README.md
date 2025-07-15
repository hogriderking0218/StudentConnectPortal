# Revelsy - Student Portal

A web-based educational platform for Grade 6 students at Our Lady of Assumption College School.

## Features

- **Student Authentication**: Secure login with Replit Auth
- **Homework Submission**: Upload and track homework assignments
- **Real-time Chat**: Communicate with classmates
- **Progress Tracking**: Monitor completed work and submissions
- **Profile Management**: Update student information

## For Students

1. Log in with your Replit account
2. Submit homework by uploading files
3. Chat with your classmates
4. Track your completed assignments
5. Update your profile information

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **Real-time**: WebSocket for chat
- **Deployment**: Railway

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Replit account for authentication

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Secret for session management
   - `REPL_ID` - Replit app ID
   - `REPLIT_DOMAINS` - Allowed domains
4. Push database schema: `npm run db:push`
5. Start development server: `npm run dev`

### Production Deployment

1. Build the application: `npm run build`
2. Start production server: `npm start`

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session secret key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Comma-separated list of allowed domains
- `NODE_ENV` - Environment (development/production)

## Database Schema

The application uses the following main tables:
- `users` - Student profiles and authentication
- `assignments` - Homework submissions and tracking
- `chat_messages` - Real-time chat messages
- `sessions` - User session storage

## Contributing

This is a school project for Grade 6 students. The application is designed to be simple and educational.

## License

MIT License