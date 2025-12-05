

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Code,
  Database,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import { Footer } from '@/components/layout/footer';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden animated-gradient">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-headline">
                The Definitive Canadian Business API
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Power your applications with comprehensive, up-to-date business
                data from across Canada. Simple, reliable, and free to start.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Free API Key <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard/docs">View Docs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Built for Modern Developers
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Everything you need to integrate Canadian business data into
                your project seamlessly.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-card/80 dark:bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border"
                >
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Start Building Today
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Generate an API key in seconds and start your integration. No
                credit card required.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/signup">
                  Get Started for Free <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
