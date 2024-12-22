"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, Layout, Users, Zap, Twitter, Facebook, Instagram, Github } from 'lucide-react';
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      {/* Header */}
      <motion.header 
        className="py-4 bg-background/10 backdrop-filter backdrop-blur-lg shadow-sm sticky top-0 z-50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="PayTrack Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-primary text-xl">
              PayTrack
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-primary/80 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-primary/80 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4">
              Revolutionizing Payment Tracking
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-primary leading-tight mb-6">
              Effortless Payment Tracking for Modern Teams
            </h1>
            <p className="text-xl sm:text-2xl text-primary/80 mb-8">
              Centralize project payments, empower stakeholders, and stay ahead
              with automated updates. Experience the future of financial management.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Try Now for Free
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="default" size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            className="relative z-10 hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Image
              src="/bg.svg"
              alt="PayTrack Illustration"
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 sm:py-32 bg-background/50 backdrop-filter backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Why Choose PayTrack?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the power of streamlined payment management with our
              cutting-edge features.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout className="h-10 w-10 text-primary" />}
              title="Intuitive Dashboard"
              description="Get a bird's-eye view of all your payments with our user-friendly dashboard. Track progress, spot trends, and make informed decisions."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Stakeholder Management"
              description="Add and manage stakeholders for each project. Improve communication and keep everyone in the loop with role-based access control."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Real-time Notifications"
              description="Stay updated with instant WhatsApp notifications. Never miss a payment update or important milestone again."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background/50 backdrop-filter backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground">
                © {new Date().getFullYear()} PayTrack. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow bg-background/50 backdrop-filter backdrop-blur-sm border-primary/10">
        <CardHeader>
          <div className="p-2 bg-primary/10 rounded-full inline-block mb-2">
            {icon}
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

