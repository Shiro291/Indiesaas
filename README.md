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
- **Emails**: Resend
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

# Needed for emails (Resend)
RESEND_API_KEY="" # Your Resend API key
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

## Getting Your API Keys

### Better Auth Secret Key
1. Generate a secure secret key using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Database URL
1. Sign up for a PostgreSQL database provider (like Neon, Supabase, or AWS RDS)
2. Create a new database
3. Copy the connection string and add it to `DATABASE_URL`

### Ipaymu API Keys
1. Register for an Ipaymu merchant account at [ipaymu.com](https://www.ipaymu.com/)
2. Log into your Ipaymu dashboard
3. Navigate to Settings > API Settings
4. Copy your API key and merchant code
5. For testing, you can use Ipaymu's sandbox environment

### Resend API Key
1. Sign up for an account at [resend.com](https://resend.com/)
2. Create an API key in the dashboard
3. Verify your sending domain if needed

### UploadThing Token
1. Sign up for an account at [uploadthing.com](https://uploadthing.com/)
2. Create a new application
3. Copy your application token from the settings

### Stripe Keys (Optional)
1. Sign up for a Stripe account at [stripe.com](https://stripe.com/)
2. In the dashboard, go to Developers > API keys
3. Copy your secret key and webhook signing secret

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
- API keys for all required services (Ipaymu, Resend, UploadThing, etc.)

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