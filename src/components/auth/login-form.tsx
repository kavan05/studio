"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={staggerItem}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </FormLabel>
                <FormControl>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-0.5 input-glow"
                    />
                  </motion.div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </FormLabel>
                <FormControl>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-0.5 input-glow"
                    />
                  </motion.div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full glow-sm group"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <Lock className="mr-2 h-4 w-4" />}
              Log In
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>
    </Form>
  );
}
