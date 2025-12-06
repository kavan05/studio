'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} BizHub API. All Rights Reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors group"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
