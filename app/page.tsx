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
import {
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  Layout,
  Users,
  Zap,
  Twitter,
  Facebook,
  Instagram,
  Github,
} from "lucide-react";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <header className="py-4 bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="PayTrack Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-gray-800 dark:text-white text-xl">
              PayTrack
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <Badge variant="secondary" className="mb-4">
            Revolutionizing Payment Tracking
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Effortless Payment Tracking <br className="hidden sm:block" /> for
            Modern Teams
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Centralize project payments, empower stakeholders, and stay ahead
            with automated updates. Experience the future of financial management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto animate-bounce"
                >
                  Start Free Trial
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
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 opacity-20 z-0"></div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 sm:py-32 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose PayTrack?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the power of streamlined payment management with our
              cutting-edge features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout className="h-10 w-10 text-blue-500" />}
              title="Intuitive Dashboard"
              description="Get a bird's-eye view of all your payments with our user-friendly dashboard. Track progress, spot trends, and make informed decisions."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-green-500" />}
              title="Stakeholder Management"
              description="Add and manage stakeholders for each project. Improve communication and keep everyone in the loop with role-based access control."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-yellow-500" />}
              title="Real-time Notifications"
              description="Stay updated with instant WhatsApp notifications. Never miss a payment update or important milestone again."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 sm:py-32 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See what our customers have to say about how PayTrack has
              transformed their payment management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              avatar="/sarah.png"
              quote="PayTrack has revolutionized how we handle project payments. It's intuitive, powerful, and has saved us countless hours."
              author="Sarah Johnson"
              role="Project Manager, TechCorp"
            />
            <TestimonialCard
              avatar="/michael.png"
              quote="The real-time notifications and stakeholder management features are game-changers. Our team's communication has never been better."
              author="Michael Chen"
              role="CFO, InnovateCo"
            />
            <TestimonialCard
              avatar="/emma.png"
              quote="As a freelancer, PayTrack helps me stay on top of my finances effortlessly. It's become an indispensable tool in my workflow."
              author="Emma Rodriguez"
              role="Independent Consultant"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} PayTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-2">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
function TestimonialCard({ avatar, quote, author, role }: { avatar: string; quote: string; author: string; role: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Image
          src={avatar}
          alt={`${author} Avatar`}
          width={48}
          height={48}
          className="rounded-full mb-4 mx-auto"
        />
        <CardTitle className="text-lg font-semibold">{author}</CardTitle>
        <CardDescription>{role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 italic">"{quote}"</p>
      </CardContent>
    </Card>
  );
}
