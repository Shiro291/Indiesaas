import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} EventTS. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm hover:underline">
            Terms
          </Link>
          <Link href="/contact" className="text-sm hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}