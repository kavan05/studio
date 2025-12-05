
"use client";

import { useTransition } from "react";
import { triggerManualSync } from "@/actions/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

export function ManualSyncCard() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const result = await triggerManualSync();
      if (result.success) {
        toast({
          title: "Sync Started",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: result.message,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Ingestion</CardTitle>
        <CardDescription>
          Manually trigger the process to fetch the latest business data from government sources. This can take several minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="font-medium">Sync Business Data</p>
          <p className="text-sm text-muted-foreground">
            Last sync: Never
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sync Data Now
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will start the data synchronization process, which can be resource-intensive and may take several minutes to complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSync}>
                Yes, Start Sync
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
