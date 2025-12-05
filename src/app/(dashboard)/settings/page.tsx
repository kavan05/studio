import { SettingsCard } from "@/components/dashboard/settings-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DUMMY_USER_ID = "user123";
const DUMMY_USER_EMAIL = "developer@example.com";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
        Settings
      </h1>
      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details. This information is not shared publicly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <p className="text-base font-semibold">{DUMMY_USER_EMAIL}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-sm font-mono text-muted-foreground">{DUMMY_USER_ID}</p>
            </div>
          </CardContent>
        </Card>
        <SettingsCard userId={DUMMY_USER_ID} />
      </div>
    </div>
  );
}