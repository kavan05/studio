
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
);

const formSchema = z
  .object({
    // Step 1
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().refine((val) => passwordValidation.test(val), {
      message:
        'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.',
    }),
    confirmPassword: z.string(),
    // Step 2
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    profession: z.string().min(1, { message: 'Please select your profession.' }),
    // Step 3
    referralSource: z
      .string()
      .min(1, { message: 'Please let us know how you found us.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

const steps = [
  {
    id: 'Step 1',
    name: 'Account Information',
    fields: ['email', 'password', 'confirmPassword'],
  },
  {
    id: 'Step 2',
    name: 'Personal Details',
    fields: ['name', 'profession'],
  },
  {
    id: 'Step 3',
    name: 'Final Touches',
    fields: ['referralSource'],
  },
];

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profession: '',
      referralSource: '',
    },
  });

  type FieldName = keyof FormValues;

  const next = async () => {
    const fields = steps[currentStep].fields as FieldName[];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await signup(values.email, values.password, {
        name: values.name,
        profession: values.profession,
        referralSource: values.referralSource,
      });
      toast({
        title: 'Account Created',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'This email might already be in use. Please try another.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      <Progress value={progressValue} className="w-full h-2" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentStep === 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            {...field}
                            className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1"
                          />
                        </FormControl>
                         <FormDescription className="text-xs">
                          Must be 8+ characters with uppercase, lowercase, number, and special symbol.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1">
                              <SelectValue placeholder="Select your profession" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="manager">
                              Product Manager
                            </SelectItem>
                            <SelectItem value="marketer">Marketer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 2 && (
                <FormField
                  control={form.control}
                  name="referralSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about us?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 focus:-translate-y-1">
                            <SelectValue placeholder="Select a source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="friend">From a friend</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-4 flex justify-between">
            <Button
              type="button"
              onClick={prev}
              disabled={currentStep === 0}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {currentStep < steps.length - 1 && (
              <Button type="button" onClick={next}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <Button type="submit" className="w-fit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

    