const site_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const site = {
  name: "EventTS",
  description: "A modern event management platform built with Next.js, Drizzle, and Better Auth",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  logo: "/logo.svg",
  mailSupport: "support@eventts.com", // Support email address
  mailFrom: process.env.MAIL_FROM || "noreply@eventts.com", // Transactional email address
  links: {
    twitter: "https://twitter.com/eventts",
    github: "https://github.com/eventts/eventts",
    linkedin: "https://www.linkedin.com/company/eventts",
  }
} as const;