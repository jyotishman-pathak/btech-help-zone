
import { Check, X, Zap, Crown, Star, Shield, ChevronRight, BookOpen, Timer, BarChart3, Users, Trophy, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { auth } from "../../../../auth";
import { UpgradeButton } from "./UpgradeButton";

const PLANS = [
  {
    id: "NORMAL",
    name: "Free",
    price: 0,
    description: "Get started with the basics",
    color: "border-zinc-200 dark:border-zinc-700",
    badge: null,
    icon: Star,
    features: [
      { text: "1 full mock test", included: true },
      { text: "Basic PYQs (Physics only)", included: true },
      { text: "CEE countdown timer", included: true },
      { text: "Subject progress tracker", included: true },
      { text: "All mock tests", included: false },
      { text: "All PYQs (all subjects)", included: false },
      { text: "Score analytics & charts", included: false },
      { text: "Leaderboard access", included: false },
      { text: "College predictor", included: false },
      { text: "AI topic radar", included: false },
      { text: "1v1 Battle Arena", included: false },
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 499,
    description: "Everything you need to crack CEE",
    color: "border-zinc-900 dark:border-white",
    badge: "Most Popular",
    icon: Zap,
    features: [
      { text: "Unlimited mock tests", included: true },
      { text: "All PYQs — all subjects & years", included: true },
      { text: "CEE countdown timer", included: true },
      { text: "Subject progress tracker", included: true },
      { text: "Score trajectory charts", included: true },
      { text: "Leaderboard access", included: true },
      { text: "College predictor (AEC, JEC, BBEC)", included: true },
      { text: "Bilingual (English + Assamese)", included: true },
      { text: "AI topic radar", included: false },
      { text: "1v1 Battle Arena", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "SUPER_PREMIUM",
    name: "Elite",
    price: 999,
    description: "For students serious about top ranks",
    color: "border-amber-400 dark:border-amber-500",
    badge: "All Features",
    icon: Crown,
    features: [
      { text: "Everything in Premium", included: true },
      { text: "AI-powered topic strength radar", included: true },
      { text: "Weakness prediction engine", included: true },
      { text: "1v1 live Battle Arena", included: true },
      { text: "Personalised study plan", included: true },
      { text: "Priority WhatsApp support", included: true },
      { text: "Early access to new content", included: true },
      { text: "Doubt solving sessions (2/month)", included: true },
      { text: "All future features free", included: true },
      { text: "Performance report PDF", included: true },
      { text: "Parent dashboard access", included: true },
    ],
  },
] as const;

const COMPARISON_FEATURES = [
  { name: "Mock Tests", free: "1", premium: "Unlimited", elite: "Unlimited" },
  { name: "PYQs Access", free: "Limited", premium: "All subjects", elite: "All subjects" },
  { name: "Analytics", free: "—", premium: "Charts + trajectory", elite: "AI-powered" },
  { name: "Leaderboard", free: "—", premium: "✓", elite: "✓" },
  { name: "College Predictor", free: "—", premium: "✓", elite: "✓" },
  { name: "Battle Arena", free: "—", premium: "—", elite: "✓" },
  { name: "Support", free: "Community", premium: "Email", elite: "WhatsApp Priority" },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Subscriptions are monthly and you can cancel before the next billing cycle. Access continues until the period ends." },
  { q: "Is my payment secure?", a: "All payments are processed by Razorpay — India's most trusted payment gateway — with bank-grade encryption." },
  { q: "Do you offer student discounts?", a: "Yes! Students with a valid college email get 20% off. Contact us on WhatsApp after purchase." },
  { q: "What if I'm not satisfied?", a: "We offer a 7-day refund if you haven't taken more than 2 mock tests. Just email us." },
  { q: "Can I upgrade mid-month?", a: "Yes. When you upgrade, your new tier activates immediately and the 30-day period starts fresh." },
];

export default async function PricingPage() {
  const session = await auth();
  const userTier = (session?.user as any)?.tier ?? null;
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* Hero */}
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-zinc-900/10 px-4 py-1.5 rounded-full text-sm font-medium mb-2">
            <Shield className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            Invest in your rank.
          </h1>
          <p className="text-xl text-zinc-400 dark:text-zinc-600 max-w-xl mx-auto">
            One month of Premium costs less than a single coaching class. Pick the plan that fits your ambition.
          </p>
          {userTier && userTier !== "NORMAL" && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold">
              <Check className="w-4 h-4" /> You're on {userTier} — you're all set!
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = userTier === plan.id;
            const isFree = plan.price === 0;
            const isAmber = plan.id === "SUPER_PREMIUM";

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 ${plan.color} bg-white dark:bg-zinc-900 p-6 space-y-6 ${plan.id === "PREMIUM" ? "md:-mt-4 md:shadow-2xl" : ""}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${plan.id === "SUPER_PREMIUM" ? "bg-amber-400 text-amber-900" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"}`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isAmber ? "bg-amber-100 dark:bg-amber-900/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                    <Icon className={`w-5 h-5 ${isAmber ? "text-amber-600 dark:text-amber-400" : "text-zinc-700 dark:text-zinc-300"}`} />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{plan.description}</p>
                </div>

                <div>
                  {isFree ? (
                    <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">Free</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-zinc-500">₹</span>
                      <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">{plan.price.toLocaleString("en-IN")}</span>
                      <span className="text-zinc-500 text-sm">/month</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="w-full h-11 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-semibold">
                    ✓ Current Plan
                  </div>
                ) : isFree ? (
                  session?.user ? (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full h-11 border-zinc-200 dark:border-zinc-700">
                        Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button variant="outline" className="w-full h-11 border-zinc-200 dark:border-zinc-700">
                        Get Started Free
                      </Button>
                    </Link>
                  )
                ) : session?.user ? (
                  <UpgradeButton
                    tier={plan.id as "PREMIUM" | "SUPER_PREMIUM"}
                    label={`Get ${plan.name}`}
                    userEmail={userEmail}
                    userName={userName}
                    className={`w-full h-11 ${isAmber ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"}`}
                  />
                ) : (
                  <Link href={`/login?callbackUrl=/pricing`}>
                    <Button className={`w-full h-11 ${isAmber ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"}`}>
                      Login to Upgrade
                    </Button>
                  </Link>
                )}

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-sm ${f.included ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}`}>
                      {f.included
                        ? <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0 mt-0.5" />}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: Shield, text: "Secure payments via Razorpay" },
            { icon: Timer, text: "Cancel anytime, no lock-in" },
            { icon: Users, text: "2,800+ students already enrolled" },
            { icon: Trophy, text: "Avg rank improvement: 340 positions" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Icon className="w-5 h-5 text-zinc-500 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-tight">{text}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 space-y-4">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 text-center">Full Comparison</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Feature</th>
                  {["Free", "Premium", "Elite"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 text-sm font-black text-zinc-900 dark:text-zinc-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.name} className={`border-b border-zinc-100 dark:border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"}`}>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-zinc-500 dark:text-zinc-400">{row.free}</td>
                    <td className="px-4 py-3 text-sm text-center text-zinc-700 dark:text-zinc-300 font-medium">{row.premium}</td>
                    <td className="px-4 py-3 text-sm text-center text-amber-600 dark:text-amber-400 font-medium">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 text-center">Frequently Asked</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{q}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-4 p-8 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <h2 className="text-2xl font-black">Still thinking? Don't.</h2>
          <p className="text-zinc-400 dark:text-zinc-600">Every day without Premium is a day of practice you can't get back.</p>
          {!session?.user ? (
            <Link href="/register">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 h-12 px-8">
                Start Free Today <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : userTier === "NORMAL" ? (
            <UpgradeButton tier="PREMIUM" label="Upgrade to Premium — ₹499/mo" userEmail={userEmail} userName={userName}
              className="h-12 px-8 bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800" />
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white h-12 px-8">
                Back to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}