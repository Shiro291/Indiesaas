# EventTS - Event Management Application

## Project Overview

EventTS is a modern, full-stack web platform for event discovery and management built with Next.js, Drizzle ORM, and a variety of modern technologies. The application provides both public-facing features for event discovery and registration, as well as an admin panel for event management and analytics.

### Key Features
- **Public Features:**
  - Event discovery with search and filtering
  - Event detail pages with real-time registration counters
  - User dashboard for managing registrations
  - Multi-step registration flow with attendee details
  - Online payments via Ipaymu
  - File uploads for documents

- **Admin Features:**
  - Admin dashboard with analytics
  - Event management (CRUD operations)
  - Registration management and filtering
  - Category management
  - Event archiving
  - Export to CSV

### Tech Stack
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

### Project Structure
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

### Database Schema
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

## Building and Running

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run migrations: `npx drizzle-kit push`
5. Start the development server: `npm run dev`

### Development Commands
- **Development:** `npm run dev` (or `next dev --turbopack`)
- **Build:** `npm run build` (or `next build`)
- **Start Production:** `npm start` (or `next start`)
- **Lint:** `npm run lint` (or `biome check`)
- **Type Check:** `npm run check-types` (or `tsc --noEmit`)
- **Database Push:** `npm run db:push` (or `npx drizzle-kit push`)
- **Database Studio:** `npm run db:studio` (or `npx drizzle-kit studio`)

### Environment Variables
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
MAIL_FROM="noreply@yourdomain.com" # Email address to send from

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

## Development Conventions

### Code Quality
- Using Biome for linting and formatting
- TypeScript for type safety
- Strict TypeScript settings
- Code formatting with 4-space indentation and no semicolons in JavaScript

### File Structure
- Next.js App Router structure
- TypeScript path aliases (using `@/*` for `./src/*`)
- Component organization in dedicated directories
- Database schema in `src/database/schema.ts`

### Database
- PostgreSQL with Drizzle ORM
- Migration files in the `migrations` directory
- Enum usage for status fields

### Styling
- Tailwind CSS for styling
- Shadcn/ui for reusable UI components

### Authentication
- Better Auth for authentication
- Middleware protection for admin routes
- Session-based authentication with cookies

### API Endpoints
- `GET /api/events` - Get all events with search and filter options
- `GET /api/events/[id]` - Get specific event details
- `POST /api/events/[id]/register` - Register for an event
- `GET|POST /api/admin/events` - Manage events
- `GET /api/admin/events/[id]/registrations` - Get event registrations
- `GET /api/admin/events/[id]/registrations/export` - Export registrations to CSV
- `GET /api/admin/analytics` - Get analytics data
- `GET|POST /api/admin/categories` - Manage categories
- `POST /api/admin/login` - Authenticate admin access
- `POST /api/payments/ipaymu-callback` - Handle payment callbacks from Ipaymu

### Payment Integration
The application uses Ipaymu for payment processing. The payment flow is:
1. User selects tickets and completes registration details
2. System creates a payment transaction with Ipaymu
3. User is redirected to Ipaymu's payment page
4. After payment, Ipaymu sends a callback to `/api/payments/ipaymu-callback`
5. System updates registration status based on callback

### File Uploads
File uploads are handled through UploadThing for:
- Event images (when creating/editing events)
- Attendee biodata documents
- Parental consent forms

### Admin Access
To access the admin panel, you first need to create an account and then use the secret key authentication:
- Navigate to `/admin/login`
- Use your account credentials along with the secret key: `13June2003`