# EventTS - Implementation Guide with Modern Tech Stack

## Core Concepts & Architecture

**Project Structure:**
- Utilize **Turborepo** to manage a monorepo structure. This will house the main web application, a potential embeddable widget, and shared packages.
- The main application will be a **Next.js** project, leveraging its App Router for a modern, file-system-based routing approach for both frontend pages and backend API routes.

**Frontend:**
- Build the user interface using **shadcn/ui**. This library will be the source for all components like buttons, forms, tables, modals, and data displays, ensuring a consistent and accessible design.
- Implement a clean, modern, and responsive layout with support for both light and dark themes.
- State management should be handled appropriately, using React's built-in state for component-level logic and a global state solution (like React Context or Zustand) for application-wide data like user authentication status.

**Backend & Database:**
- The backend logic will reside within Next.js API Routes (`/app/api/.../route.ts`).
- All database interactions must be handled through **Drizzle ORM**, which provides type-safe queries for our **PostgreSQL** database. Define your database schema using Drizzle's schema definitions.
- Business logic should be encapsulated in dedicated service functions or server actions, separate from the API route handlers themselves. For example, a `createRegistration` function would contain the core logic, and the API route would simply call this function.

**Key Integrations:**
- **Authentication:** Implement user and admin authentication using **Better Auth UI**. This will provide pre-built, secure components for login, signup, and password management.
- **Payments:** Integrate **Ipaymu** as the exclusive payment provider. Handle creating payment transactions, managing user redirects to the payment page, and processing callbacks to verify transaction status.
- **File Uploads:** Use **UploadThing** for all file uploads, such as event images, attendee biodata, and parental consent documents. This provides a streamlined solution for file handling and storage.
- **Emails:** Use **Nodemailer** to send all transactional emails, including registration confirmations, payment receipts, and bulk messages to attendees.
- **Code Quality:** Configure and use **Biome** as the linter and formatter across the entire monorepo to maintain consistent and clean code.

---

## Feature Implementation Guide

### 1. Public-Facing Features

**Event Discovery (Homepage):**
- **Backend:** Create a `GET /api/events` endpoint. This handler should use a service function to fetch events from the database, supporting query parameters for search (by name) and filtering (by category and registration status).
- **Frontend:** On the homepage, use `shadcn/ui` components like `Card` to display each event. Fetch data from the `/api/events` endpoint using a Next.js data fetching method (e.g., `fetch` in a Server Component or a client-side hook). Implement search input and filter dropdowns that update the API call.

**Event Detail Page:**
- **Backend:** Create a `GET /api/events/[id]` endpoint to fetch a single event's full details, including its associated tickets and categories.
- **Frontend:** Build a dynamic route page (`/events/[id]`). Display all event information using `shadcn/ui` components. Implement a real-time countdown timer using `useEffect` and `setInterval` that shows when registration opens or closes based on the event's data.

**User Authentication & Dashboard:**
- **Backend:** Implement authentication routes using Better Auth (`/api/auth/...`). Create a `GET /api/dashboard` endpoint that fetches the logged-in user's registered events and provides intelligent recommendations for new events.
- **Frontend:** Use the **Better Auth UI** components to render the login and signup forms. After login, redirect users to their personal dashboard (`/dashboard`). This page should display a list of their registered events and a section for recommended events.

**Multi-Step Registration Flow:**
- **Backend:**
    1.  Create a `POST /api/events/[id]/register` endpoint to initialize a registration.
    2.  Create a `POST /api/registrations/[id]/attendees` endpoint to submit attendee details.
    3.  Create a `POST /api/registrations/[id]/payment` endpoint. This handler will interact with the **Ipaymu** service to create a payment transaction, passing the total amount and user details. It will receive a unique payment URL from Ipaymu and return it to the frontend.
- **Frontend:**
    - When a user clicks "Register," open a multi-step modal/ dialog built with `shadcn/ui`.
    - **Step 1 (Tickets):** Fetch available tickets for the event. Allow the user to select the quantity. Validate against the event's capacity.
    - **Step 2 (Attendee Details):** Dynamically render a form for each ticket selected. The form must include fields for: Full Name, Gender, Age Category (TK, SD, SMP, SMA), Belt Level (DASAR, MC I, MC II, MC III, MC IV), and Phone Number. Use **UploadThing** widgets for uploading optional Biodata and Parental Consent files, including client-side validation for file type and size.
    - **Step 3 (Payment):** Display a cost summary (subtotal + admin fee). Present the user with payment method options: "Online Payment (via Ipaymu)" and "Offline Payment". If "Online Payment" is selected, upon clicking "Pay," the frontend will call the payment endpoint and then use `window.location.href` to redirect the user to the payment URL returned by Ipaymu. For free events, this step should be skipped.
- **Post-Registration:** After completing the Ipaymu payment, the user will be redirected back to a status page on your site (`/registration/[id]/status`). This page will display the final payment status. For offline payments, this page will show instructions for manual payment.

### 2. Admin-Only Features

**Admin Access:**
- **Frontend:** Create a hidden login link on the main application. The admin login page should contain fields for email, password, and a static "Secret Key" input.
- **Backend:** In the admin login API handler, validate that the provided secret key matches `"13June2003"` before authenticating the user as an admin.

**Event Management (CRUD):**
- **Backend:** Create full CRUD API endpoints for events: `GET /api/admin/events`, `POST /api/admin/events`, `PUT /api/admin/events/[id]`, `DELETE /api/admin/events/[id]`. Use **UploadThing** to handle the event image uploads.
- **Frontend:** Build an admin dashboard section (`/admin/events`). Use a `shadcn/ui` `Table` component to list all events. This table should display key details and provide actions to edit or delete each event. Create separate forms using `shadcn/ui` components for creating and editing events.

**Registration Management & Export:**
- **Backend:** Create a `GET /api/admin/events/[id]/registrations` endpoint. This endpoint must support query parameters for sorting and filtering by `ageCategory` and `beltLevel`. Create a `GET /api/admin/events/[id]/registrations/export` endpoint that streams a CSV file of the filtered registrations.
- **Frontend:** On the admin event detail page, display a list of all registrants in a `shadcn/ui` `Table`. Implement dropdown filters for "Kategori" (TK, SD, etc.) and "Tingkatan Sabuk" (DASAR, MC I, etc.). Add an "Export to CSV" button that triggers the download from the export endpoint. Provide links to view/download the documents uploaded via **UploadThing**.

**Analytics Dashboard:**
- **Backend:** Create `GET /api/admin/analytics` and `GET /api/admin/analytics/reports` endpoints. To ensure performance, pre-calculate statistics (total revenue, total registrations) and store them in dedicated database tables (e.g., `EventStatistics`). Update these tables using a background job or a callback listener triggered by successful payments.
- **Frontend:** Create an admin analytics page (`/admin/analytics`). Display KPIs in stat cards. Use a charting library (like Recharts) to visualize data, such as a bar chart for monthly revenue and a pie chart for sales distribution by event.

**Category Management:**
- **Backend:** Create CRUD API endpoints for categories: `GET /api/admin/categories`, `POST /api/admin/categories`, etc.
- **Frontend:** Build a simple admin settings page (`/admin/settings/categories`) with a form to add new categories and a list to manage existing ones. The new categories should automatically appear in the event creation form dropdown.

### 3. System-Wide Features

**Payment Processing:**
- **Backend:**
    - Create an `IpaymuService` to handle all interactions with the Ipaymu API. This service will be responsible for creating payment transactions and, if needed, processing refunds.
    - Create a dedicated API endpoint for Ipaymu callbacks, e.g., `POST /api/payments/ipaymu-callback`. This endpoint must be secured (e.g., by verifying a signature or token from Ipaymu) to prevent fraudulent requests.
    - When a callback is received for a successful payment, the handler should find the corresponding registration, update its status to 'confirmed', and trigger a confirmation email via **Nodemailer**.
- **Frontend:** The frontend's primary role is to initiate the payment and redirect the user to the Ipaymu-hosted payment page where they can choose from various methods (Virtual Account, GoPay, OVO, etc.).

**Invoicing:**
- **Backend:** Upon successful payment completion (triggered by the Ipaymu callback), generate a PDF invoice. Use a library like `@react-pdf/renderer` or a server-side PDF generator. Store the invoice URL in the database.
- **Frontend:** On the user's dashboard and registration status pages, provide a button to "Download Invoice."

**Bulk Messaging:**
- **Backend:** Create a `Message` model and API endpoints for admins to create and send messages. The message creation form should include filters (e.g., by ticket type, payment status). When an admin sends a message, dispatch a background job that queries the filtered users and sends emails to all of them using **Nodemailer**.

**Event Archiving:**
- **Backend:** Add a `status` enum to the `Event` model with values `ACTIVE` and `ARCHIVED`.
- **Frontend:** In the admin event list, add an "Archive" action. Archived events should be hidden from the main admin dashboard view but accessible via a separate "Archived Events" link or toggle.

### EventTS: Project Summary

**Project Overview**
EventTS is a modern, full-stack web platform for event discovery and management. It serves a dual audience: the general public, who can find and register for events, and administrators, who have a comprehensive dashboard to manage the entire system. The application is built with a focus on a clean UI, robust functionality, and a scalable architecture using a modern tech stack.

**Core Technology Stack**
*   **Framework:** Next.js with the App Router.
*   **Monorepo:** Turborepo for efficient code management.
*   **UI Components:** shadcn/ui for a consistent and accessible design system.
*   **Database:** PostgreSQL, managed with the type-safe Drizzle ORM.
*   **Authentication:** Better Auth UI for secure and pre-built login/signup flows.
*   **Payment Provider:** Ipaymu for handling all online transactions.
*   **File Uploads:** UploadThing for modern, integrated file storage and validation.
*   **Email Service:** Nodemailer for sending transactional emails.
*   **Code Quality:** Biome for fast and reliable linting and formatting.

**Key Features for Public Users**
*   **Event Discovery:** A dynamic homepage to browse, search, and filter events by category and status.
*   **Event Details:** Detailed event pages with a real-time countdown timer for registration deadlines.
*   **User Dashboard:** A personal space for users to view their registered events and receive personalized recommendations.
*   **Multi-Step Registration:** An intuitive, guided process for event registration that includes:
    *   Ticket selection.
    *   Dynamic forms for attendee details, including specific Indonesian categories (Age: TK, SD, SMP, SMA; Belt Level: DASAR, MC I, MC II, MC III, MC IV).
    *   Secure file uploads for biodata and parental consent via UploadThing.
    *   A streamlined payment process redirecting to Ipaymu or an option for offline payment.

**Key Features for Administrators**
*   **Secure Admin Portal:** A hidden login area protected by a static secret key.
*   **Event Management (CRUD):** Full administrative control to create, view, edit, and delete events, including image uploads.
*   **Registration Oversight:** Ability to view, filter (by age category and belt level), and export attendee lists to CSV. Admins can also access and download all submitted documents.
*   **Analytics Dashboard:** A dedicated dashboard with KPIs and interactive charts (e.g., revenue, registration stats) to monitor platform performance.
*   **System Management:** Tools to manage event categories and archive old events, keeping the main dashboard clean.

**Critical System Integrations**
*   **Ipaymu Payments:** The system integrates with Ipaymu to create payment transactions and redirects users to the Ipaymu payment page. Payment status is verified and updated via a secure callback API.
*   **UploadThing:** All file handling, from event cover images to attendee documents, is managed through UploadThing, providing a seamless and secure upload experience.
*   **Nodemailer Emails:** All automated communications, such as registration confirmations and payment receipts, are reliably sent using the Nodemailer email service.
