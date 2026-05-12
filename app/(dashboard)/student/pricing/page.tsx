// app/(dashboard)/student/pricing/page.tsx
import { Check, X, Zap, Crown, Star, Shield, ChevronRight, Timer, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { auth } from "../../../../auth";
import { UpgradeButton } from "./UpgradeButton";

const PLANS = [
  {
    id: "NORMAL",
    name: "Free",
    price: 0,
    description: "Dip your toes in — no card needed",
    accent: "from-slate-400 to-slate-500",
    border: "border-slate-200 dark:border-slate-700",
    badge: null,
    icon: Star,
    features: [
      { text: "1 full mock test", included: true },
      { text: "Basic PYQs (Physics only)", included: true },
      { text: "CEE countdown timer", included: true },
      { text: "Subject progress tracker", included: true },
      { text: "All mock tests", included: false },
      { text: "All PYQs — all subjects", included: false },
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
    accent: "from-indigo-500 to-violet-600",
    border: "border-indigo-400 dark:border-indigo-500",
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
    accent: "from-amber-400 to-orange-500",
    border: "border-amber-400 dark:border-amber-500",
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
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A]">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 text-white">
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-indigo-700/30" />
          <div className="absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full border border-indigo-600/20" />
          <div className="absolute top-10 right-10 w-[200px] h-[200px] rounded-full border border-violet-500/20" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full border border-indigo-700/20" />
          <div className="absolute bottom-0 left-1/3 w-px h-full bg-gradient-to-t from-transparent via-indigo-600/10 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold text-indigo-200 border border-white/10 mb-2">
            <Shield className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
            Invest in<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
              your rank.
            </span>
          </h1>
          <p className="text-xl text-indigo-200 max-w-xl mx-auto leading-relaxed">
            One month of Premium costs less than a single coaching class.
            Pick the plan that fits your ambition.
          </p>
          {userTier && userTier !== "NORMAL" && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-5 py-2.5 rounded-full text-sm font-semibold">
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
            const isElite = plan.id === "SUPER_PREMIUM";
            const isPremium = plan.id === "PREMIUM";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 ${plan.border} bg-white dark:bg-[#12101F] p-7 space-y-6 shadow-sm ${isPremium ? "md:-mt-4 shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/50" : ""
                  }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isElite
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                    }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.accent} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">{plan.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="pb-2">
                  {isFree ? (
                    <p className="text-5xl font-black text-slate-900 dark:text-slate-50">Free</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-400">₹</span>
                      <span className={`text-5xl font-black bg-gradient-to-r ${plan.accent} text-transparent bg-clip-text`}>
                        {plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="w-full h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold">
                    ✓ Current Plan
                  </div>
                ) : isFree ? (
                  session?.user ? (
                    <Link href="/dashboard">
                      <button className="w-full h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2">
                        Go to Dashboard <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <button className="w-full h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        Get Started Free
                      </button>
                    </Link>
                  )
                ) : session?.user ? (
                  <UpgradeButton
                    tier={plan.id as "PREMIUM" | "SUPER_PREMIUM"}
                    label={`Get ${plan.name}`}
                    userEmail={userEmail}
                    userName={userName}
                    className={`w-full h-12 rounded-2xl font-bold text-sm text-white transition shadow-lg ${isElite
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-200/50 dark:shadow-amber-900/30"
                        : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200/50 dark:shadow-indigo-900/30"
                      }`}
                  />
                ) : (
                  <Link href={`/login?callbackUrl=/pricing`}>
                    <button className={`w-full h-12 rounded-2xl font-bold text-sm text-white transition shadow-lg ${isElite
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-200/50"
                        : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200/50"
                      }`}>
                      Login to Upgrade
                    </button>
                  </Link>
                )}

                {/* Features */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-3 text-sm ${f.included ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"}`}>
                        {f.included ? (
                          <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.accent} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          </span>
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {[
            { icon: Shield, text: "Secure payments via Razorpay", color: "text-indigo-500" },
            { icon: Timer, text: "Cancel anytime, no lock-in", color: "text-violet-500" },
            { icon: Users, text: "2,800+ students enrolled", color: "text-amber-500" },
            { icon: Trophy, text: "Avg rank up 340 positions", color: "text-orange-500" },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight">{text}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-20 space-y-5">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Compare</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50">Full Breakdown</h2>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12101F] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1A1730] border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">Feature</th>
                  {[
                    { label: "Free", color: "text-slate-500" },
                    { label: "Premium", color: "text-indigo-600 dark:text-indigo-400" },
                    { label: "Elite", color: "text-amber-600 dark:text-amber-400" },
                  ].map(({ label, color }) => (
                    <th key={label} className={`text-center px-6 py-4 text-sm font-black ${color}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.name} className={`border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/40 dark:bg-slate-800/10"}`}>
                    <td className="px-6 py-3.5 text-sm text-slate-700 dark:text-slate-300 font-semibold">{row.name}</td>
                    <td className="px-6 py-3.5 text-sm text-center text-slate-400 dark:text-slate-500">{row.free}</td>
                    <td className="px-6 py-3.5 text-sm text-center text-indigo-600 dark:text-indigo-400 font-semibold">{row.premium}</td>
                    <td className="px-6 py-3.5 text-sm text-center text-amber-600 dark:text-amber-400 font-semibold">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">FAQ</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50">Got questions?</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-6 rounded-2xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100">{q}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 text-white p-12 text-center space-y-5">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-indigo-700/30" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-violet-700/30" />
          </div>
          <div className="relative space-y-3">
            <h2 className="text-3xl font-black">Still thinking? Don't.</h2>
            <p className="text-indigo-300 text-lg">Every day without Premium is practice you can't get back.</p>
          </div>
          <div className="relative">
            {!session?.user ? (
              <Link href="/register">
                <button className="h-13 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-base hover:from-amber-300 hover:to-orange-400 transition shadow-xl shadow-amber-900/30 inline-flex items-center gap-2">
                  Start Free Today <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            ) : userTier === "NORMAL" ? (
              <UpgradeButton
                tier="PREMIUM"
                label="Upgrade to Premium — ₹499/mo"
                userEmail={userEmail}
                userName={userName}
                className="h-13 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-base hover:from-amber-300 hover:to-orange-400 transition shadow-xl shadow-amber-900/30"
              />
            ) : (
              <Link href="/dashboard">
                <button className="h-13 px-10 py-3.5 rounded-2xl bg-white/15 border border-white/20 text-white font-black text-base hover:bg-white/20 transition backdrop-blur-sm">
                  Back to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}