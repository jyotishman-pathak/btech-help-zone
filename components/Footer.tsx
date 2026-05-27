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
  { name: "Contact", href: "/student/cee/support" },
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
    <footer className="relative border-t border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-950">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative mx-auto px-4 py-14 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Atom className="h-6 w-6 text-slate-900 dark:text-white" />
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">CEE Prep</span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Built for Class 11–12 PCM students targeting Assam CEE 2026. PYQs, timed mocks, and rank-focused prep—all in one place.
            </p>

            {/* Social + Trust */}
            <div className="mt-6 flex items-center gap-4">
              <SocialIcon network="twitter" url="https://x.com" className="h-8 w-8 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" />
              <SocialIcon network="linkedin" url="https://linkedin.com" className="h-8 w-8 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" />
              <SocialIcon network="instagram" url="https://instagram.com" className="h-8 w-8 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live: CEE 2026 prep portal
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Subjects</h3>
            <ul className="mt-4 space-y-3">
              {subjectLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                    <link.icon className="h-4 w-4 text-slate-400" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
    Resources
  </h3>

  <ul className="mt-4 space-y-3">
    {resourceLinks.map((link) => (
      <li key={link.name}>
        <Link
          href={link.href}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          {link.icon && (
            <link.icon className="h-4 w-4 text-slate-400" />
          )}

          {link.name}
        </Link>
      </li>
    ))}
  </ul>
</div>

          {/* Company + Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Company</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-400">Legal</h4>
              <ul className="mt-3 space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-slate-200/70 dark:border-slate-700/50 pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} CEE Prep. Built for Assam engineering aspirants.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Made by <a href="https://jyotishmanpathak.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 dark:text-slate-100 hover:underline">Jyotishman pathak</a>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> help@ceeprep.in</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</span>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="mt-10 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Ready to simulate the real CEE?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Timed mocks • Auto-grading • Rank prediction</p>
          </div>
          <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
            <Link href="/cee/mocks" className="flex items-center gap-1.5">
              Start Free Mock <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}