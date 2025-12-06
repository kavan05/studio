import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-base">
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
        <div className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            Sign up for free
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
