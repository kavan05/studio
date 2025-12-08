"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Copy, Key, Shield } from "lucide-react";

interface ApiKeyCardProps {
  apiKey: string;
  userId: string;
}

export function ApiKeyCard({ apiKey, userId: _userId }: ApiKeyCardProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Card className="glass-card border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>API Key</CardTitle>
            <CardDescription className="mt-1">
              Use this key to authenticate your API requests.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={apiKey}
            className="font-mono text-sm bg-muted/50 border-border/50"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              className="shrink-0 border-border/50 hover:border-primary/50 transition-all"
            >
              <AnimatePresence mode="wait">
                {hasCopied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-4 w-4 text-success" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Copy API Key</span>
            </Button>
          </motion.div>
        </div>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Keep your API key secure. Do not share it publicly or commit it to version control.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
