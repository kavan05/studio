'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { BizHubIcon } from "@/components/icons";
import { fadeIn, scaleIn, float, floatDelayed } from "@/lib/animations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Floating decorative elements */}
      <motion.div
        variants={float}
        initial="initial"
        animate="animate"
        className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        variants={floatDelayed}
        initial="initial"
        animate="animate"
        className="absolute bottom-20 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-8 flex justify-center"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <BizHubIcon className="h-10 w-10 text-primary transition-colors group-hover:text-accent" />
            </motion.div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              BizHub API
            </span>
          </Link>
        </motion.div>

        {/* Auth card */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
