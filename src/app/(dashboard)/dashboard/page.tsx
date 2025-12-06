
'use client';

import { motion } from "framer-motion";
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
import { Activity, BookOpen, KeyRound, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useFirestore } from "@/firebase";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  cardHover,
  scaleIn,
} from "@/lib/animations";

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

  const statsCards = [
    {
      title: "API Requests (Today)",
      value: userData.requestsToday,
      subtitle: "/ 1000 daily limit",
      icon: Activity,
      gradient: "from-primary/20 to-accent/20",
      iconColor: "text-primary",
    },
    {
      title: "API Key Status",
      value: "Active",
      subtitle: "Your key is operational",
      icon: KeyRound,
      gradient: "from-success/20 to-primary/20",
      iconColor: "text-success",
    },
    {
      title: "Documentation",
      value: "v1.0",
      subtitle: "Stable release",
      icon: BookOpen,
      gradient: "from-accent/20 to-primary/20",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Monitor your API usage and manage your account
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {statsCards.map((stat, index) => (
          <motion.div key={stat.title} variants={staggerItem}>
            <motion.div
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Card className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <ApiKeyCard apiKey={userData.apiKey} userId={user.uid} />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glass-card flex flex-col h-full border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>API Usage</CardTitle>
                  <CardDescription className="mt-1">
                    Your API request count for the last 7 days.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <UsageChart />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
