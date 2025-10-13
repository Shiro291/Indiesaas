# EventTS - Event Management Application

EventTS is a modern, full-stack web platform for event discovery and management built with Next.js, Drizzle ORM, and a variety of modern technologies.

## Features

### Public Features
- Event discovery with search and filtering
- Event detail pages with real-time registration counters
- User dashboard for managing registrations
- Multi-step registration flow with attendee details
- Online payments via Ipaymu
- File uploads for documents

### Admin Features
- Admin dashboard with analytics
- Event management (CRUD operations)
- Registration management and filtering
- Category management
- Event archiving
- Export to CSV

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth UI
- **Payments**: Ipaymu
- **File Uploads**: UploadThing
- **Emails**: Nodemailer
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Code Quality**: Biome

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run migrations: `npx drizzle-kit push`
5. Start the development server: `npm run dev`

## Environment Variables

You need to set the following environment variables in a `.env.local` file:

```env
# Required for authentication
BETTER_AUTH_SECRET="" # Generate a secure secret key
BETTER_AUTH_URL="http://localhost:3000"

# Required for database connection
DATABASE_URL="" # Your PostgreSQL connection string

# Site URL
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Your application URL

# Needed for payment processing (Ipaymu)
IPAYMU_API_KEY="" # Your Ipaymu API key
IPAYMU_MERCHANT_CODE="" # Your Ipaymu merchant code
IPAYMU_BASE_URL="https://my.ipaymu.com" # Ipaymu base URL (production or sandbox)

# Needed for emails (Nodemailer)
GMAIL_USER="" # Your Gmail address for sending emails
GMAIL_APP_PASSWORD="" # Your Gmail app password
MAIL_FROM="" # Email address to send from (can be same as GMAIL_USER)

# Needed for file uploads (UploadThing)
UPLOADTHING_TOKEN="" # Your UploadThing token

# Optional: OAuth providers (configure as needed)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# TWITTER_CLIENT_ID=""
# TWITTER_CLIENT_SECRET=""

# Needed for Stripe plugin (if using)
STRIPE_SECRET_KEY="sk_test_..." # Your Stripe secret key
STRIPE_WEBHOOK_SECRET="whsec_..." # Your Stripe webhook secret
```

## Getting Your API Keys

### Better Auth Secret Key
This key is used for authentication encryption. You'll need to generate a secure secret key:
1. Open your terminal/command prompt
2. Run the following command to generate a secure random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Copy the generated string and use it as your `BETTER_AUTH_SECRET`
4. Add this to your `.env.local` file as `BETTER_AUTH_SECRET="your-generated-secret"`

### Database URL (PostgreSQL)
You'll need a PostgreSQL database connection string:
1. Choose a PostgreSQL provider (options include [Neon](https://neon.tech/), [Supabase](https://supabase.com/), [Railway](https://railway.app/), [AWS RDS](https://aws.amazon.com/rds/), or a self-hosted solution)

#### Option 1: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com/) and sign up for an account
2. Create a new project in the dashboard
3. Once created, navigate to Project Settings > Database
4. Find your connection string in the "Connection String" section
5. Copy the connection string and add it to your `.env.local` as `DATABASE_URL="your-supabase-connection-string"`
   - Note: For Supabase, add `?sslmode=require` to the end of the connection string:
   - `postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require`

#### Option 2: Neon
1. Go to [neon.tech](https://neon.tech/)
2. Create an account and log in
3. Create a new project
4. Once created, find your connection string in the "Connection Details" section
5. Copy the connection string and add it to your `.env.local` as `DATABASE_URL="your-connection-string"`

6. Make sure to update your `.env.local` with the complete connection string:
   - For Supabase: `DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require"`
   - For Neon: `DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]"`

### Ipaymu API Keys
This application uses Ipaymu for payment processing. To get your API keys:
1. If you don't have an account, register for an Ipaymu merchant account at [ipaymu.com](https://www.ipaymu.com/)
2. Log into your Ipaymu dashboard
3. Navigate to Settings > API Settings (or look for "API Configuration")
4. Copy your API key and merchant code
5. For development/testing, you can use Ipaymu's sandbox environment:
   - IPAYMU_BASE_URL: `https://sandbox.ipaymu.com`
   - Your API key and merchant code from sandbox dashboard
6. For production, use:
   - IPAYMU_BASE_URL: `https://my.ipaymu.com`
   - Your production API key and merchant code
7. Add these to your `.env.local` file:
   - `IPAYMU_API_KEY="your-api-key"`
   - `IPAYMU_MERCHANT_CODE="your-merchant-code"`
   - `IPAYMU_BASE_URL="https://my.ipaymu.com"` (or sandbox URL)

### Nodemailer Configuration (Gmail)
This application now uses Nodemailer for sending emails. To configure email functionality:

#### Option 1: Gmail (Recommended for development)
1. Use an existing Gmail account or create a new one for your application
2. Go to your [Google Account settings](https://myaccount.google.com/)
3. Navigate to Security > 2-Step Verification > App passwords
4. Generate an app password for your application:
   - Select "Mail" as the app
   - Select "Other" as the device and name it (e.g. "EventTS")
   - Copy the 16-character generated password
5. Add these to your `.env.local` file:
   - `GMAIL_USER="your-email@gmail.com"`
   - `GMAIL_APP_PASSWORD="your-16-char-app-password"`
   - `MAIL_FROM="your-email@gmail.com"` or your preferred "from" address

#### Option 2: Other email providers
If you want to use other email providers with Nodemailer, you'll need to:
1. Research the specific configuration for your email service provider
2. Update the transporter configuration in `src/lib/auth.ts` and `src/lib/services/registration.service.ts`
3. Add the necessary environment variables to your `.env.local` file

For more information about Nodemailer configuration options, visit [nodemailer.com](https://nodemailer.com/)

### UploadThing Token
This is used for file upload functionality:
1. Visit [uploadthing.com](https://uploadthing.com/) and sign up for an account
2. After logging in, create a new application
3. Copy your application token from the settings page
4. Add to your `.env.local` as `UPLOADTHING_TOKEN="your-uploadthing-token"`
5. During development, you might need to set up proper webhook endpoints to handle file upload callbacks in production

### OAuth Providers (Optional)
If you want to enable OAuth login (Google, GitHub, Twitter/X), follow these steps for each provider:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if required)
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Set application type to "Web Application"
6. Add your domain to "Authorized redirect URIs":
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` and add to your `.env.local`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000` (development) or your domain
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github` (development) or your domain equivalent
4. Copy `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` and add to your `.env.local`

#### Twitter/X OAuth
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account if you don't have one
3. Create a new app
4. Under "App Keys and Tokens", find your API key and secret
5. Set up OAuth 2.0 redirect URIs similar to the other providers
6. Copy `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` and add to your `.env.local`

### Stripe Keys (Optional)
If using Stripe for payments instead of Ipaymu:
1. Go to [stripe.com](https://stripe.com/) and sign up for an account
2. After logging in, go to Developers > API keys
3. Find your "Secret key" and copy it
4. For webhook signing secret, go to Developers > Webhooks
5. Click "Add endpoint" and create a webhook endpoint
6. Copy the signing secret from the webhook details
7. Add to your `.env.local`:
   - `STRIPE_SECRET_KEY="sk_test_..."`
   - `STRIPE_WEBHOOK_SECRET="whsec_..."`

## Admin Access

To access the admin panel, you first need to create an account and then use the secret key authentication:
- Navigate to `/admin/login`
- Use your account credentials along with the secret key: `13June2003`

## API Endpoints

### Public APIs
- `GET /api/events` - Get all events with search and filter options
- `GET /api/events/[id]` - Get specific event details
- `POST /api/events/[id]/register` - Register for an event

### Admin APIs
- `GET|POST /api/admin/events` - Manage events
- `GET /api/admin/events/[id]/registrations` - Get event registrations
- `GET /api/admin/events/[id]/registrations/export` - Export registrations to CSV
- `GET /api/admin/analytics` - Get analytics data
- `GET|POST /api/admin/categories` - Manage categories
- `POST /api/admin/login` - Authenticate admin access
- `POST /api/payments/ipaymu-callback` - Handle payment callbacks from Ipaymu

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (marketing)      # Marketing pages (home, about, etc.)
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes for events, payments, auth
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # User dashboard
│   ├── events/          # Public event pages
│   ├── registration/    # Registration flow pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── providers.tsx    # Global providers
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── icons/          # Icon components
│   ├── layout/         # Layout components
│   ├── ui/             # Reusable UI components
│   └── uploadthing.tsx # UploadThing component
├── config/             # Configuration files
│   └── site.ts         # Site configuration
├── database/           # Database schema and connection
│   ├── db.ts           # Database connection
│   └── schema.ts       # Database schema definitions
├── lib/                # Utility functions and services
│   ├── ipaymu/         # Ipaymu service
│   ├── payments/       # Payment-related functions
│   ├── services/       # Business logic services
│   ├── admin-auth.ts   # Admin authentication helpers
│   ├── auth.ts         # Authentication setup
│   ├── auth-client.ts  # Client-side auth helpers
│   ├── uploadthing.ts  # UploadThing helpers
│   └── utils.ts        # Utility functions
└── styles/             # Global styles
```

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `events` - Event information
- `categories` - Event categories
- `tickets` - Ticket types for events
- `registrations` - User registrations
- `attendees` - Attendee information for registrations
- `messages` - Bulk messaging system
- `eventStatistics` - Analytics data
- `sessions` - Authentication sessions
- `accounts` - OAuth account information
- `verifications` - Email verification tokens
- `subscriptions` - User subscriptions (if using Stripe)

## Payment Integration

The application uses Ipaymu for payment processing. The payment flow is:
1. User selects tickets and completes registration details
2. System creates a payment transaction with Ipaymu
3. User is redirected to Ipaymu's payment page
4. After payment, Ipaymu sends a callback to `/api/payments/ipaymu-callback`
5. System updates registration status based on callback

## File Uploads

File uploads are handled through UploadThing for:
- Event images (when creating/editing events)
- Attendee biodata documents
- Parental consent forms

## Development

### Running the Application
```bash
# Install dependencies
npm install

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

### Running Database Migrations
```bash
# Push schema changes to database
npx drizzle-kit push

# Generate a new migration
npx drizzle-kit generate

# View database in studio
npx drizzle-kit studio
```

### Type Checking
```bash
npm run check-types
```

### Code Quality
```bash
npm run lint
```

## Deployment

### Prerequisites
- A PostgreSQL database (Neon, Supabase, AWS RDS, etc.)
- API keys for all required services (Ipaymu, Nodemailer, UploadThing, etc.)

### Environment Variables for Production
Ensure you have all required environment variables set in your production environment:
- `DATABASE_URL` - Production database URL
- `BETTER_AUTH_SECRET` - Production secret key
- `BETTER_AUTH_URL` - Production URL
- `NEXT_PUBLIC_APP_URL` - Production application URL
- All other API keys for external services

### Building and Deploying
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## File Upload Configuration

The application uses UploadThing for file uploads. To use this feature:
1. Create an account at [uploadthing.com](https://uploadthing.com/)
2. Get your API key from the dashboard
3. Configure your `UPLOADTHING_TOKEN` in the environment variables
4. For local development, you might need to set up webhook endpoints to handle file upload callbacks

## License

MIT