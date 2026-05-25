import { BrainCircuit, GraduationCap, Users, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { ServicePaymentButton } from "../../../components/pricing/ServicePaymentButton";
import { auth } from "../../../auth";


export default async function PricingPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? undefined;
  const userName = session?.user?.name ?? undefined;
  return (
    <div className="bg-[#090915] min-h-screen pt-24 pb-16">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black italic text-white mb-6 tracking-tight">
          UNLOCK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">ASSAM CEE</span> POTENTIAL
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Get the edge you need with our specialized premium services. From deep insights to expert guidance, choose the tools that fit your preparation strategy.
        </p>
      </div>

      {/* Pricing Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* College Predictor Plan */}
          <div className="bg-[#13132b] border border-[#2a2a45] rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col relative group hover:border-amber-500/50">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic mb-2 uppercase tracking-wide">College Predictor</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Find out exactly which engineering colleges and branches you can secure in Assam based on your CEE scores.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">₹299</span>
              <span className="text-gray-500 text-sm">/one-time</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> AEC, JEC, JIST cutoff data integration
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Branch-wise probability scoring
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Category & reservation specific filtering
              </li>
            </ul>
            <ServicePaymentButton
              serviceType="PREDICTOR"
              label="Unlock Predictor"
              className="w-full bg-[#1a1a3a] hover:bg-amber-500 text-white font-bold py-6 rounded-xl transition-colors"
              userEmail={userEmail}
              userName={userName}
            />
          </div>

          {/* Deep Analytics Plan */}
          <div className="bg-[#13132b] border border-violet-500/50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col relative group shadow-[0_0_40px_rgba(124,58,237,0.15)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-t-3xl" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </div>
            <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors mt-2">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic mb-2 uppercase tracking-wide">Deep Analytics</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Unlock question-level insights and time-management tracking to understand your exact weaknesses.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">₹699</span>
              <span className="text-gray-500 text-sm">/one-time</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0" /> Topic-wise accuracy & weak-point mapping
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0" /> Time spent per question vs toppers
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0" /> Peer comparison & state-level ranking graphs
              </li>
            </ul>
            <ServicePaymentButton
              serviceType="ANALYTICS"
              label="Get Deep Analytics"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 rounded-xl transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              userEmail={userEmail}
              userName={userName}
            />
          </div>

          {/* Counselling Assistance Plan */}
          <div className="bg-[#13132b] border border-[#2a2a45] rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col relative group hover:border-emerald-500/50">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic mb-2 uppercase tracking-wide">Counselling Assist</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Personalized 1-on-1 expert guidance through the entire CEE counselling and admission process.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">₹999</span>
              <span className="text-gray-500 text-sm">/one-time</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Direct line to expert CEE counsellors
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Priority choice-filling assistance
              </li>
              <li className="flex items-start text-sm text-gray-300 gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> End-to-end document verification support
              </li>
            </ul>
            <ServicePaymentButton
              serviceType="COUNSELLING"
              label="Book Assistance"
              className="w-full bg-[#1a1a3a] hover:bg-emerald-600 text-white font-bold py-6 rounded-xl transition-colors"
              userEmail={userEmail}
              userName={userName}
            />
          </div>

        </div>
      </div>

      {/* Batches Section CTA */}
      <div className="mt-24 bg-gradient-to-r from-violet-900/40 to-[#090915] border-y border-violet-900/30 py-16 text-center px-4">
        <h2 className="text-3xl font-black italic text-white mb-6 uppercase tracking-tight">Looking for Mock Test Batches?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          We also offer full-length mock test series to simulate the real exam environment.
        </p>
        <Link href="/batches">
          <Button className="bg-white text-black hover:bg-gray-200 text-lg font-bold py-6 px-10 rounded-full">
            Explore Batches <Zap className="ml-2 w-5 h-5 fill-current" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
