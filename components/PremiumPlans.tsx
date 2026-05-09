"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Crown, Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["Limited PYQs", "Basic notes (PDF)", "2 Mock Tests/month", "Community support"],
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "semester",
    features: ["All PYQs (branch-wise)", "Advanced notes + summaries", "Unlimited mock tests", "Test access codes", "Priority support"],
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Premium+",
    price: "₹899",
    period: "full year",
    features: ["Everything in Pro", "Live doubt sessions", "Personalized study plan", "Certificate on completion", "One-on-one mentorship"],
    buttonVariant: "outline",
    popular: false,
  },
];

export function PremiumPlans() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your <span className="text-blue-600">Plan</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Flexible pricing for every student</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "shadow-xl border-blue-200 scale-105 md:scale-105" : "shadow-md"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  <Zap className="inline h-3 w-3 mr-1" /> Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {plan.name} {plan.popular && <Crown className="h-5 w-5 text-yellow-500" />}
                </CardTitle>
                <CardDescription>Best for {plan.period} access</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500"> /{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.buttonVariant as any} className="w-full" size="lg">
                  {plan.name === "Free" ? "Get Started" : "Upgrade Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}