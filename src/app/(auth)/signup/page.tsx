import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create an Account
        </CardTitle>
        <CardDescription className="text-base">
          Get your free API key in seconds. No credit card required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="flex-col gap-4 border-t border-border/50 pt-6">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
