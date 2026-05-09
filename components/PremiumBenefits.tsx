"use client";

import { CheckCircle2, Infinity, Shield, Trophy, FileCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

const benefits = [
  { icon: Infinity, title: "Unlimited Access", desc: "All PYQs, notes & mock tests without restrictions" },
  { icon: FileCheck, title: "Advanced Notes", desc: "Topper's handwritten notes & video summaries" },
  { icon: Trophy, title: "Full Mock Tests", desc: "Subject-wise, topic-wise & full syllabus tests" },
  { icon: Shield, title: "Admin-Coded Tests", desc: "Secure test access with private codes" },
  { icon: Sparkles, title: "Priority Support", desc: "Doubt solving within 24 hours" },
];

export function PremiumBenefits() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Go <span className="text-blue-600">Premium?</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Everything you need to crack exams and ace semesters</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{benefit.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <CheckCircle2 className="h-4 w-4" /> Free users get 5 PYQs + 2 mock tests per month
          </div>
        </div>
      </div>
    </section>
  );
}