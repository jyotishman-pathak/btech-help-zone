// components/Footer.tsx
"use client";

import Link from "next/link";
import { Atom, FlaskConical, Sigma, FileCheck, Timer, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { Button } from "./ui/button";

const subjectLinks = [
  { name: "Physics", href: "/cee/physics", icon: Atom },
  { name: "Chemistry", href: "/cee/chemistry", icon: FlaskConical },
  { name: "Mathematics", href: "/cee/maths", icon: Sigma },
];

const resourceLinks = [
  { name: "CEE PYQs", href: "/cee/pyqs", icon: FileCheck },
  { name: "Mock Tests", href: "/cee/mocks", icon: Timer },
  { name: "Formula Sheets", href: "/cee/revision" },
  { name: "Syllabus Breakdown", href: "/cee/syllabus" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
];

const legalLinks = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Refund Policy", href: "/refund" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative mx-auto px-4 py-14 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Atom className="h-6 w-6 text-zinc-900 dark:text-white" />
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">CEE Prep</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Built for Class 11–12 PCM students targeting Assam CEE 2026. PYQs, timed mocks, and rank-focused prep—all in one place.
            </p>

            {/* Social + Trust */}
            <div className="mt-6 flex items-center gap-4">
              <SocialIcon network="twitter" url="https://x.com" className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors" />
              <SocialIcon network="linkedin" url="https://linkedin.com" className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors" />
              <SocialIcon network="instagram" url="https://instagram.com" className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live: CEE 2026 prep portal
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Subjects</h3>
            <ul className="mt-4 space-y-3">
              {subjectLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                    <link.icon className="h-4 w-4 text-zinc-400" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
    Resources
  </h3>

  <ul className="mt-4 space-y-3">
    {resourceLinks.map((link) => (
      <li key={link.name}>
        <Link
          href={link.href}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          {link.icon && (
            <link.icon className="h-4 w-4 text-zinc-400" />
          )}

          {link.name}
        </Link>
      </li>
    ))}
  </ul>
</div>

          {/* Company + Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Company</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400">Legal</h4>
              <ul className="mt-3 space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} CEE Prep. Built for Assam engineering aspirants.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> help@ceeprep.in</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</span>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="mt-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Ready to simulate the real CEE?</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Timed mocks • Auto-grading • Rank prediction</p>
          </div>
          <Button asChild size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            <Link href="/cee/mocks" className="flex items-center gap-1.5">
              Start Free Mock <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}