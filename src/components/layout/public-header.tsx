import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BizHubIcon } from "../icons";
import { ThemeToggle } from "../theme-toggle";

export function PublicHeader() {
  const isAuthenticated = false; // Placeholder for auth state

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between mx-auto px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BizHubIcon className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">BizHub API</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             <Link href="/dashboard/docs" className="text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
          </nav>
          <ThemeToggle />
          {isAuthenticated ? (
            <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
