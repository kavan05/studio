
'use client';

import { ApiKeyCard } from "@/components/dashboard/api-key-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc } from "firebase/firestore";
import { Activity, BookOpen, KeyRound, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFirestore } from "@/firebase";

interface UserData {
  apiKey: string;
  requestsToday: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            apiKey: data.apiKey,
            requestsToday: data.requestsToday || 0,
          });
        }
        setLoading(false);
      };
      fetchUserData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, firestore, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userData) {
    return (
       <div className="text-center">
        <p>Could not load user data. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              API Requests (Today)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.requestsToday}</div>
            <p className="text-xs text-muted-foreground">/ 1000 daily limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Key Status</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Your key is operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Documentation
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.0</div>
            <p className="text-xs text-muted-foreground">
              Stable release
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApiKeyCard apiKey={userData.apiKey} userId={user.uid} />
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-headline">API Usage</CardTitle>
            <CardDescription>
              Your API request count for the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <UsageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
