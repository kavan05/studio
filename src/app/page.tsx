
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Code,
  Database,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import { Footer } from '@/components/layout/footer';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  heroTitle,
  heroSubtitle,
  heroCTA,
  staggerContainer,
  staggerItem,
  cardHover,
  float,
  floatDelayed,
} from '@/lib/animations';

const features = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: 'Powerful Search',
    description:
      'Access millions of Canadian business records with our fast, reliable, and easy-to-use search endpoints.',
  },
  {
    icon: <Database className="w-8 h-8 text-primary" />,
    title: 'Up-to-Date Data',
    description:
      'Our data is automatically synced weekly from official government portals to ensure accuracy and freshness.',
  },
  {
    icon: <Code className="w-8 h-8 text-primary" />,
    title: 'Developer Focused',
    description:
      'Clean documentation, a generous free tier, and a dedicated developer dashboard to manage your keys and track usage.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'Secure & Scalable',
    description:
      'Built on modern Firebase infrastructure, ensuring your application has a secure and scalable foundation.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 animated-gradient" />

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 mesh-gradient" />

          {/* Floating decorative elements */}
          <motion.div
            variants={float}
            initial="initial"
            animate="animate"
            className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatDelayed}
            initial="initial"
            animate="animate"
            className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          />

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Title with animation */}
              <motion.div
                variants={heroTitle}
                initial="hidden"
                animate="visible"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Trusted by developers across Canada</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  The Definitive Canadian Business API
                </h1>
              </motion.div>

              {/* Subtitle with animation */}
              <motion.p
                variants={heroSubtitle}
                initial="hidden"
                animate="visible"
                className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              >
                Power your applications with comprehensive, up-to-date business
                data from across Canada. Simple, reliable, and free to start.
              </motion.p>

              {/* CTA buttons with animation */}
              <motion.div
                variants={heroCTA}
                initial="hidden"
                animate="visible"
                className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="glow group text-base px-8">
                    <Link href="/signup" className="flex items-center gap-2">
                      Get Free API Key
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" variant="outline" className="text-base px-8 glass">
                    <Link href="/dashboard/docs">View Documentation</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Enterprise Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Millions of Records</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Built for Modern Developers
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg lg:text-xl">
                Everything you need to integrate Canadian business data into
                your project seamlessly.
              </p>
            </motion.div>

            {/* Feature cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={staggerItem}>
                  <motion.div
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Card className="glass-card h-full group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300">
                      <CardHeader className="space-y-4">
                        {/* Icon with background */}
                        <motion.div
                          className="relative"
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl w-fit">
                            <div className="relative z-10">{feature.icon}</div>
                          </div>
                          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        </motion.div>

                        {/* Content */}
                        <div className="space-y-2">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-radial" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              {/* Glass card wrapper */}
              <div className="glass-card p-8 md:p-12 lg:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Start Building Today
                  </h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-6 text-muted-foreground md:text-lg lg:text-xl leading-relaxed"
                >
                  Generate an API key in seconds and start your integration. No
                  credit card required.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-8"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild size="lg" className="glow text-base px-8 group">
                      <Link href="/signup" className="flex items-center gap-2">
                        Get Started for Free
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Additional info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    Free tier included
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    No credit card needed
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    Start in minutes
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
