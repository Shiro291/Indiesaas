

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
*   **Email Service:** Resend for sending transactional emails.
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
*   **Resend Emails:** All automated communications, such as registration confirmations and payment receipts, are reliably sent using the Resend email service.
