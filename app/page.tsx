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
import { ArrowUpRight, Layout, Users, Zap, Twitter, Facebook, Instagram, Github, Play, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <main className="min-h-screen background relative overflow-hidden" ref={ref}>
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/abstract-bg.svg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          y: backgroundY,
        }}
      />

      {/* Header */}
      <motion.header 
        className="py-4 bg-background/80 backdrop-filter backdrop-blur-lg shadow-sm sticky top-0 z-50"
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
            <span className="font-bold text-gradient text-xl">
              PayTrack
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#testimonials">Testimonials</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </nav>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" size="sm" className="button-gradient">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="button-gradient">
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
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gradient leading-tight mb-6 hero-text-shadow">
              Effortless Payment Tracking for Modern Teams
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
              Centralize project payments, empower stakeholders, and stay ahead
              with automated updates. Experience the future of financial management.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto button-gradient"
                  >
                    Try Now for Free
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="default" size="lg" className="w-full sm:w-auto button-gradient">
                    Go to Dashboard
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-5 w-5" />
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
              src="/preview.png"
              alt="PayTrack Dashboard Preview"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-8 w-8 text-primary" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 sm:py-32 bg-gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gradient mb-4">
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gradient mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about PayTrack.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="PayTrack has revolutionized how we manage project payments. It's a game-changer!"
              author="Jane Doe"
              company="Tech Innovators Inc."
            />
            <TestimonialCard
              quote="The real-time notifications have saved us countless hours of back-and-forth communication."
              author="John Smith"
              company="Global Solutions Ltd."
            />
            <TestimonialCard
              quote="Intuitive, powerful, and reliable. PayTrack is everything we needed for our payment tracking."
              author="Emily Johnson"
              company="Creative Minds Agency"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground">
                © {new Date().getFullYear()} PayTrack. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter className="h-6 w-6" />} label="Twitter" />
              <SocialLink href="#" icon={<Facebook className="h-6 w-6" />} label="Facebook" />
              <SocialLink href="#" icon={<Instagram className="h-6 w-6" />} label="Instagram" />
              <SocialLink href="#" icon={<Github className="h-6 w-6" />} label="GitHub" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-foreground/80 hover:text-foreground transition-colors relative group"
    >
      {children}
      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </Link>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="card-hover bg-card border-primary/10">
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

function TestimonialCard({ quote, author, company }: { quote: string; author: string; company: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="card-hover bg-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">"{quote}"</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground">
            {author}, {company}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
      <span className="sr-only">{label}</span>
      {icon}
    </Link>
  );
}

