import { Check, CheckSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "../lib/utils";
import prisma from "../lib/prisma.client";
import { Batch, BatchFeature } from "@prisma/client";

type BatchWithFeatures = Batch & { features: BatchFeature[] };


function calcDiscount(price: number, original: number) {
  return Math.round(((original - price) / original) * 100);
}

function BatchCard({
  batch,
}: {
  batch: BatchWithFeatures;
}) {
  const originalPrice = batch.originalPrice;
  const discount = !batch.isFree && originalPrice
    ? calcDiscount(batch.price, originalPrice)
    : null;

  return (
    <div className="relative flex flex-col bg-[#0d0d20] border border-[#1e1e3a] rounded-2xl overflow-hidden hover:border-violet-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(124,58,237,0.15)]">
      {/* Purple header bar */}
      <div className="bg-gradient-to-r from-fuchsia-700 to-violet-700 px-4 py-3 flex items-center gap-2.5">
        <CheckSquare className="w-4 h-4 text-white shrink-0" />
        <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
          CEE 2026 Mock Test Series
        </span>
      </div>

      <div className="flex flex-col flex-1 p-6 space-y-5">
        {/* Tag + discount row */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase",
            batch.isFree
              ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40"
              : "bg-[#1a1a30] text-gray-300 border border-[#2a2a45]"
          )}>
            {batch.tagline}
          </span>
          {discount && (
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2.5 py-1 rounded tracking-wider uppercase">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Batch name */}
        <div>
          <h3 className="text-[28px] md:text-[32px] font-black italic text-white leading-none tracking-tight">
            {batch.name.toUpperCase()} BATCH
          </h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            {batch.description}
          </p>
        </div>

        {/* Price box */}
        <div className="bg-[#060610] border border-[#1a1a30] rounded-xl p-4">
          {batch.isFree ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-500 text-sm font-medium">Rs.</span>
                <span className="text-4xl font-black text-white">FREE</span>
                <span className="text-gray-500 text-sm">/batch</span>
              </div>
              <p className="text-emerald-400 text-xs font-bold tracking-wider mt-1.5">
                NO PAYMENT REQUIRED
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-500 text-sm font-medium">Rs.</span>
                <span className="text-4xl font-black text-white">
                  {(batch.price / 100).toLocaleString("en-IN")}
                </span>
                <span className="text-gray-500 text-sm">/batch</span>
              </div>
              {originalPrice && (
                <p className="text-gray-600 text-xs mt-1.5 line-through">
                  MRP Rs. {(originalPrice / 100).toLocaleString("en-IN")}
                </p>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase mb-3">
            Included Features
          </p>
          <ul className="space-y-2.5">
            {batch.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link href={`/batches/${batch.slug}`} className="block">
          <button className={cn(
            "w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200",
            batch.isFree
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.4)]"
          )}>
            {batch.isFree ? "Get Started Free" : "Enroll Now"}
          </button>
        </Link>
      </div>
    </div>
  );
}

export async function CEEPricing() {
  let batches: BatchWithFeatures[] = [];
  try {
    batches = await prisma.batch.findMany({
      where: { isActive: true, isPublished: true, deletedAt: null },
      include: { features: { orderBy: { order: "asc" } } },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    batches = [];
  }

  if (batches.length === 0) {
    return (
      <section className="bg-[#090915] py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-black italic text-3xl md:text-5xl text-white mb-4">
            PREMIUM BATCHES COMMING SOON
          </h2>
          <p className="text-gray-400">
            We are currently updating our mock test batches. Please check back later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#090915] py-20 md:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-black italic text-[clamp(28px,6vw,64px)] leading-tight tracking-tight">
            <span className="text-white">CHOOSE YOUR </span>
            <span
              style={{
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CEE
            </span>
            <span className="text-white"> MOCK TEST BATCH</span>
          </h2>

          {/* Divider + quote */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-0.5 h-5 bg-violet-500 rounded-full" />
            <p className="text-gray-400 italic text-sm md:text-base">
              &quot;Select the perfect batch for your CEE preparation journey.&quot;
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {batches.map((batch: BatchWithFeatures) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      </div>
    </section>
  );
}