"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";

interface ApiKeyCardProps {
  apiKey: string;
  userId: string;
}

export function ApiKeyCard({ apiKey, userId }: ApiKeyCardProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">API Key</CardTitle>
        <CardDescription>
          Use this key to authenticate your API requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input readOnly value={apiKey} className="font-mono" />
          <Button variant="outline" size="icon" onClick={onCopy}>
            {hasCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy API Key</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Keep your API key secure. Do not share it publicly.
        </p>
      </CardContent>
    </Card>
  );
}
