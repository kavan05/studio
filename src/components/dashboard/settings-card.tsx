"use client";

import { useTransition } from "react";
import { generateNewApiKey } from "@/actions/user";
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useFirebaseApp } from "@/firebase";

export function SettingsCard({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const app = useFirebaseApp();

  const handleGenerateKey = () => {
    startTransition(async () => {
      const result = await generateNewApiKey(userId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "A new API key has been generated.",
        });
      }
    });
  };

  const handleSyncData = () => {
    startSyncTransition(async () => {
      try {
        const functions = getFunctions(app);
        const manualDataSync = httpsCallable(functions, 'manualDataSync');
        const result = await manualDataSync();
        console.log('Sync result:', result.data);
        toast({
          title: "Sync Started",
          description: "Data sync started successfully. It may take a few minutes.",
        });
      } catch (error) {
         console.error("Sync function call error:", error);
         const err = error as any;
         toast({
          variant: "destructive",
          title: "Sync Failed",
          description: err.message || "An unexpected error occurred during sync",
        });
      }
    });
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>
            Manually trigger a sync of business data from external sources. This process can take several minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <p className="font-medium">Sync Business Data</p>
            <p className="text-sm text-muted-foreground">
              Fetch the latest business listings from government open data portals.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button
                disabled={isSyncing}
                variant="outline"
              >
                {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sync Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will start the data synchronization process. It runs in the background and may take several minutes to complete. You can check the function logs for progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSyncData}
                >
                  Yes, Start Sync
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <p className="font-medium">Generate New API Key</p>
            <p className="text-sm text-muted-foreground">
              Your current API key will be invalidated immediately.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently invalidate your current API key. Any
                  applications using it will no longer be able to access the API.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleGenerateKey}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, Regenerate Key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}
